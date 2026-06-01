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
import type { ClerkWebhookEvent } from "@/types/authTypes"

function safeClerkMetadata(event: ClerkWebhookEvent): Record<string, unknown> {
  return {
    resource_id: event.data.id,
    resource_type: event.type.split(".")[0] ?? "unknown",
    ...(event.data.user_id ? { clerk_user_id: event.data.user_id } : {}),
    ...(event.type.startsWith("user.") ? { clerk_user_id: event.data.id } : {}),
  }
}

async function upsertLocalUserFromClerkEvent(event: ClerkWebhookEvent) {
  const email = extractClerkUserEmail(event.data)
  const phone = extractClerkUserPhone(event.data)
  const displayName = extractClerkDisplayName(event.data)

  await prisma.$transaction(async (tx) => {
    const user = await upsertUserFromClerkTx(tx, {
      clerkUserId: event.data.id,
      email: email ?? null,
      phone: phone ?? null,
      displayName: displayName ?? null,
    })

    await createDefaultVerificationProfileTx(tx, { userId: user.id })

    await tx.auditEvent.create({
      data: {
        eventName: event.type,
        actorType: "clerk",
        entityType: "user",
        entityId: user.id,
        metadata: {
          clerk_user_id: event.data.id,
        },
      },
    })
  })
}

async function disableLocalUserFromClerkEvent(event: ClerkWebhookEvent) {
  await prisma.$transaction(async (tx) => {
    const updated = await softDisableUserFromClerkDeletedTx(tx, { clerkUserId: event.data.id })

    const user = await tx.user.findUnique({
      where: { clerkUserId: event.data.id },
      select: { id: true },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "user.deleted",
        actorType: "clerk",
        entityType: "user",
        entityId: user?.id ?? event.data.id,
        metadata: {
          clerk_user_id: event.data.id,
          local_user_updated: updated.count > 0,
        },
      },
    })
  })
}

async function processSupportedClerkEvent(event: ClerkWebhookEvent) {
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await upsertLocalUserFromClerkEvent(event)
      return
    case "user.deleted":
      await disableLocalUserFromClerkEvent(event)
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
    if (
      parsed.type !== "user.created" &&
      parsed.type !== "user.updated" &&
      parsed.type !== "user.deleted"
    ) {
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
