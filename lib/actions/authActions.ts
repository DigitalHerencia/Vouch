// lib/actions/authActions.ts

"use server"

import { revalidatePath } from "next/cache"
import type { Prisma } from "@/prisma/generated/prisma/client"

import {
  getCurrentClerkUser,
  mapClerkUserToLocalInput,
  type LocalUserSyncInput,
} from "@/lib/auth/clerk"
import { getPostAuthRedirect } from "@/lib/auth/redirects"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  recordTermsAcceptanceTx,
  softDisableUserFromClerkDeletedTx,
  upsertUserFromClerkTx,
} from "@/lib/db/transactions/authTransactions"
import { getClientIpHash, getRequestId, getUserAgentHash } from "@/lib/security/request"
import {
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
} from "@/lib/db/transactions/webhookTransactions"
import {
  extractClerkDisplayName,
  extractClerkUserEmail,
  extractClerkUserPhone,
} from "@/lib/auth/clerk-webhook-helpers"
import type { ClerkWebhookEvent, ClerkWebhookUserData } from "@/types/auth"
import { clerkWebhookEventSchema, supportedClerkWebhookEventTypeSchema } from "@/schemas/auth"

const CURRENT_TERMS_VERSION = "2026-05-22"

async function syncClerkUser(input: LocalUserSyncInput) {
  const user = await prisma.$transaction(async (tx) => {
    const syncedUser = await upsertUserFromClerkTx(tx, input)
    await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })
    await tx.auditEvent.create({
      data: {
        eventName: "user.synced",
        actorType: "clerk",
        entityType: "user",
        entityId: syncedUser.id,
        metadata: { clerk_user_id: syncedUser.clerkUserId },
      },
    })
    return syncedUser
  })

  revalidatePath("/dashboard")
  return { ok: true as const, data: { userId: user.id } }
}

export async function completeSignUpWithTermsAcceptance(input: { acceptedUserAgreement: boolean }) {
  if (input.acceptedUserAgreement !== true) {
    return {
      ok: false as const,
      code: "TERMS_ACCEPTANCE_REQUIRED" as const,
      message: "You must accept the User Agreement before creating an account.",
    }
  }

  const localUser = await ensureLocalUserForSession()
  if (!localUser.ok) return localUser

  const acceptedAt = new Date()
  const [requestId, ipHash, userAgentHash] = await Promise.all([
    getRequestId(),
    getClientIpHash(),
    getUserAgentHash(),
  ])

  await prisma.$transaction((tx) =>
    recordTermsAcceptanceTx(tx, {
      userId: localUser.data.userId,
      termsVersion: CURRENT_TERMS_VERSION,
      acceptedAt,
      ipHash,
      userAgentHash,
      requestId,
    })
  )

  revalidatePath("/dashboard")
  return { ok: true as const, data: { userId: localUser.data.userId } }
}

function safeClerkMetadata(event: ClerkWebhookEvent): Prisma.InputJsonObject {
  return {
    resource_id: event.data.id,
    resource_type: event.type.split(".")[0] ?? "unknown",
    ...(event.data.user_id ? { clerk_user_id: event.data.user_id } : {}),
    ...(event.type.startsWith("user.") ? { clerk_user_id: event.data.id } : {}),
  }
}

function messageTargetEmail(data: ClerkWebhookUserData) {
  return data.email_address ?? extractClerkUserEmail(data)
}

function messageTargetPhone(data: ClerkWebhookUserData) {
  return data.phone_number ?? extractClerkUserPhone(data)
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

async function upsertClerkSessionProjection(event: ClerkWebhookEvent) {
  const now = new Date()
  const update: Prisma.ClerkSessionUpdateInput = {
    status: event.type.replace("session.", ""),
    lastEventType: event.type,
  }
  if (event.data.user_id) update.clerkUserId = event.data.user_id
  if (event.type === "session.ended") update.endedAt = now
  if (event.type === "session.removed") update.removedAt = now
  if (event.type === "session.revoked") update.revokedAt = now

  await prisma.clerkSession.upsert({
    where: { id: event.data.id },
    create: {
      id: event.data.id,
      clerkUserId: event.data.user_id ?? null,
      status: event.type.replace("session.", ""),
      lastEventType: event.type,
      endedAt: event.type === "session.ended" ? now : null,
      removedAt: event.type === "session.removed" ? now : null,
      revokedAt: event.type === "session.revoked" ? now : null,
    },
    update,
  })
}

async function upsertClerkEmailProjection(event: ClerkWebhookEvent, svixId: string) {
  const id = event.data.email_address_id ?? event.data.id ?? `svix:${svixId}`
  const toEmail = messageTargetEmail(event.data)
  const update: Prisma.ClerkEmailUpdateInput = {
    lastEventType: event.type,
  }
  if (event.data.user_id) update.clerkUserId = event.data.user_id
  if (event.data.status) update.status = event.data.status
  if (toEmail) update.toEmail = toEmail

  await prisma.clerkEmail.upsert({
    where: { id },
    create: {
      id,
      clerkUserId: event.data.user_id ?? null,
      status: event.data.status ?? null,
      toEmail: toEmail ?? null,
      lastEventType: event.type,
    },
    update,
  })
}

async function upsertClerkSmsProjection(event: ClerkWebhookEvent, svixId: string) {
  const id = event.data.phone_number_id ?? event.data.id ?? `svix:${svixId}`
  const toPhone = messageTargetPhone(event.data)
  const update: Prisma.ClerkSmsUpdateInput = {
    lastEventType: event.type,
  }
  if (event.data.user_id) update.clerkUserId = event.data.user_id
  if (event.data.status) update.status = event.data.status
  if (toPhone) update.toPhone = toPhone

  await prisma.clerkSms.upsert({
    where: { id },
    create: {
      id,
      clerkUserId: event.data.user_id ?? null,
      status: event.data.status ?? null,
      toPhone: toPhone ?? null,
      lastEventType: event.type,
    },
    update,
  })
}

async function upsertClerkInvitationProjection(event: ClerkWebhookEvent) {
  const now = new Date()
  const status = event.type.replace("invitation.", "")
  const emailAddress = messageTargetEmail(event.data)
  const update: Prisma.ClerkInvitationUpdateInput = {
    status,
    lastEventType: event.type,
  }
  if (event.data.user_id) update.clerkUserId = event.data.user_id
  if (emailAddress) update.emailAddress = emailAddress
  if (event.type === "invitation.accepted") update.acceptedAt = now
  if (event.type === "invitation.revoked") update.revokedAt = now

  await prisma.clerkInvitation.upsert({
    where: { id: event.data.id },
    create: {
      id: event.data.id,
      clerkUserId: event.data.user_id ?? null,
      emailAddress: emailAddress ?? null,
      status,
      lastEventType: event.type,
      acceptedAt: event.type === "invitation.accepted" ? now : null,
      revokedAt: event.type === "invitation.revoked" ? now : null,
    },
    update,
  })
}

async function processSupportedClerkEvent(event: ClerkWebhookEvent, svixId: string) {
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await upsertLocalUserFromClerkEvent(event)
      return
    case "user.deleted":
      await disableLocalUserFromClerkEvent(event)
      return
    case "session.created":
    case "session.pending":
    case "session.ended":
    case "session.removed":
    case "session.revoked":
      await upsertClerkSessionProjection(event)
      return
    case "email.created":
      await upsertClerkEmailProjection(event, svixId)
      return
    case "sms.created":
      await upsertClerkSmsProjection(event, svixId)
      return
    case "invitation.created":
    case "invitation.accepted":
    case "invitation.revoked":
      await upsertClerkInvitationProjection(event)
      return
    default:
      throw new Error(`Unsupported Clerk event reached processor: ${event.type}`)
  }
}

export async function processClerkWebhookEvent(event: ClerkWebhookEvent, svixId: string) {
  const parsed = clerkWebhookEventSchema.parse(event) as ClerkWebhookEvent
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
    const supported = supportedClerkWebhookEventTypeSchema.safeParse(parsed.type)
    if (!supported.success) {
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

    await processSupportedClerkEvent(parsed, svixId)
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

async function ensureLocalUserForSession() {
  const clerkUser = await getCurrentClerkUser()
  if (!clerkUser) {
    return { ok: false as const, code: "UNAUTHENTICATED" }
  }

  return syncClerkUser(mapClerkUserToLocalInput(clerkUser))
}

export async function resolvePostAuthRedirect(input?: unknown) {
  const params =
    input && typeof input === "object"
      ? (input as {
          redirect_url?: string | string[]
          redirectUrl?: string | string[]
          return_to?: string | string[]
          returnTo?: string | string[]
        })
      : {}

  return { ok: true as const, data: { redirectTo: getPostAuthRedirect(params) } }
}
