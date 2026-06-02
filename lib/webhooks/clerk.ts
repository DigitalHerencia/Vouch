import "server-only"

import {
  extractClerkDisplayName,
  extractClerkUserEmail,
  extractClerkUserPhone,
} from "@/lib/auth/clerk-webhook-helpers"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  softDisableUserFromClerkDeletedTx,
  upsertUserFromClerkTx,
} from "@/lib/db/transactions/authTransactions"
import {
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
} from "@/lib/db/transactions/webhookTransactions"
import {
  SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES,
  type ClerkWebhookEvent,
  type ClerkWebhookUserData,
} from "@/types/authTypes"
import type { Prisma } from "@/prisma/generated/prisma/client"

function safeClerkMetadata(event: ClerkWebhookEvent): Record<string, unknown> {
  const clerkUserId = getClerkUserIdFromEvent(event)

  return {
    resource_id: event.data.id,
    resource_type: event.type.split(".")[0] ?? "unknown",
    ...(event.id ? { clerk_event_id: event.id } : {}),
    ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}),
  }
}

function isSupportedClerkEventType(type: string): boolean {
  return SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES.includes(
    type as (typeof SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES)[number]
  )
}

function getClerkUserIdFromEvent(event: ClerkWebhookEvent): string | undefined {
  if (event.type.startsWith("user.")) return event.data.id
  return event.data.user_id ?? event.data.user?.id ?? undefined
}

function getUserDataFromEvent(event: ClerkWebhookEvent): ClerkWebhookUserData | undefined {
  if (event.type.startsWith("user.")) return event.data
  return event.data.user ?? undefined
}

async function recordClerkAuditEvent(input: {
  eventName: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        eventName: input.eventName,
        actorType: "clerk",
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata as Prisma.InputJsonObject,
      },
    })
  } catch (error) {
    console.warn("Clerk webhook audit logging failed.", error)
  }
}

async function upsertLocalUserFromClerkData(eventType: string, data: ClerkWebhookUserData) {
  const email = extractClerkUserEmail(data)
  const phone = extractClerkUserPhone(data)
  const displayName = extractClerkDisplayName(data)

  const user = await prisma.$transaction(async (tx) => {
    const user = await upsertUserFromClerkTx(tx, {
      clerkUserId: data.id,
      email: email ?? null,
      phone: phone ?? null,
      displayName: displayName ?? null,
    })

    await createDefaultVerificationProfileTx(tx, { userId: user.id })

    return user
  })

  await recordClerkAuditEvent({
    eventName: eventType,
    entityType: "user",
    entityId: user.id,
    metadata: {
      clerk_user_id: data.id,
    },
  })
}

async function disableLocalUserFromClerkEvent(event: ClerkWebhookEvent) {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await softDisableUserFromClerkDeletedTx(tx, { clerkUserId: event.data.id })

    const user = await tx.user.findUnique({
      where: { clerkUserId: event.data.id },
      select: { id: true },
    })

    return { userId: user?.id ?? event.data.id, updated: updated.count > 0 }
  })

  await recordClerkAuditEvent({
    eventName: "user.deleted",
    entityType: "user",
    entityId: result.userId,
    metadata: {
      clerk_user_id: event.data.id,
      local_user_updated: result.updated,
    },
  })
}

async function updateLocalUserEmailFromClerkEvent(event: ClerkWebhookEvent) {
  if (event.type !== "email.created" || !event.data.user_id || !event.data.email_address) return

  const clerkUserId = event.data.user_id
  const emailAddress = event.data.email_address

  const localUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.updateMany({
      where: { clerkUserId },
      data: { email: emailAddress },
    })

    if (user.count === 0) return null

    return tx.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    })
  })

  if (!localUser) return

  await recordClerkAuditEvent({
    eventName: "email.created",
    entityType: "user",
    entityId: localUser.id,
    metadata: {
      clerk_user_id: clerkUserId,
      clerk_email_id: event.data.id,
    },
  })
}

async function processSupportedClerkEvent(event: ClerkWebhookEvent) {
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await upsertLocalUserFromClerkData(event.type, event.data)
      return
    case "user.deleted":
      await disableLocalUserFromClerkEvent(event)
      return
    case "email.created":
      await updateLocalUserEmailFromClerkEvent(event)
      return
    case "session.created": {
      const user = getUserDataFromEvent(event)
      if (user) await upsertLocalUserFromClerkData(event.type, user)
      return
    }
    case "session.ended":
    case "session.pending":
    case "session.removed":
    case "session.revoked":
      return
    default:
      throw new Error(`Unsupported Clerk event reached processor: ${event.type}`)
  }
}

export async function processClerkWebhookEvent(event: ClerkWebhookEvent, svixId: string) {
  const parsed = event
  const providerEventId = svixId

  const ledger = await prisma.$transaction((tx) =>
    recordProviderWebhookReceivedTx(tx, {
      provider: "clerk",
      providerEventId,
      eventType: parsed.type,
      safeMetadata: safeClerkMetadata(parsed),
    })
  )

  if (ledger.duplicate && ledger.event.processed) {
    return { ok: true as const, status: "duplicate" as const, ignored: true as const }
  }

  try {
    if (!isSupportedClerkEventType(parsed.type)) {
      await prisma.$transaction((tx) =>
        markProviderWebhookIgnoredTx(tx, {
          id: ledger.event.id,
          reason: "Unsupported Clerk event type.",
        })
      )
      return {
        ok: true as const,
        status: "ignored" as const,
        ignored: true as const,
        reason: "Unsupported event type.",
      }
    }

    await processSupportedClerkEvent(parsed)
    await prisma.$transaction((tx) => markProviderWebhookProcessedTx(tx, { id: ledger.event.id }))
    return { ok: true as const, status: "processed" as const, ignored: false as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Clerk webhook processing failed."
    await prisma.$transaction((tx) =>
      markProviderWebhookFailedTx(tx, { id: ledger.event.id, error: message })
    )
    return { ok: false as const, status: "failed" as const, message }
  }
}
