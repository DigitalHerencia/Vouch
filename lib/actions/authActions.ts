"use server"

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { mapClerkUserToLocalInput, type LocalUserSyncInput } from "@/lib/auth/clerk"
import { getPostAuthRedirect } from "@/lib/auth/redirects"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  upsertUserFromClerkTx,
} from "@/lib/actions/transactions/authTransactions"
import {
  markProviderWebhookFailed,
  markProviderWebhookIgnored,
  markProviderWebhookProcessed,
  recordProviderWebhookReceived,
} from "@/lib/actions/webhookActions"
import type { ClerkWebhookEvent, ClerkWebhookUserData } from "@/types/auth"
import { clerkWebhookEventSchema } from "@/schemas/auth"

export async function syncClerkUser(input: LocalUserSyncInput) {
  const user = await prisma.$transaction(async (tx) => {
    const syncedUser = await upsertUserFromClerkTx(tx, input)
    await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })
    await tx.auditEvent.create({
      data: {
        eventName: "user.synced",
        actorType: "auth_provider",
        entityType: "user",
        entityId: syncedUser.id,
        metadata: { clerk_user_id: syncedUser.clerkUserId },
      },
    })
    return syncedUser
  })

  revalidatePath("/dashboard")
  revalidatePath("/setup")
  return { ok: true as const, data: { userId: user.id } }
}

export function extractClerkUserEmail(data: ClerkWebhookUserData): string | undefined {
  const primary = data.email_addresses?.find((email) => email.id === data.primary_email_address_id)
  return primary?.email_address ?? data.email_addresses?.[0]?.email_address
}

export function extractClerkUserPhone(data: ClerkWebhookUserData): string | undefined {
  const primary = data.phone_numbers?.find((phone) => phone.id === data.primary_phone_number_id)
  return primary?.phone_number ?? data.phone_numbers?.[0]?.phone_number
}

export function extractClerkDisplayName(data: ClerkWebhookUserData): string | undefined {
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim()
  return name || data.username || extractClerkUserEmail(data)
}

export function parseClerkWebhookJson(rawBody: string): ClerkWebhookEvent {
  return clerkWebhookEventSchema.parse(JSON.parse(rawBody)) as ClerkWebhookEvent
}

export async function processClerkWebhookEvent(event: ClerkWebhookEvent) {
  const providerEventId = event.id ?? `${event.type}:${event.data.id}`

  const ledger = await recordProviderWebhookReceived({
    provider: "clerk",
    providerEventId,
    eventType: event.type,
    safeMetadata: {
      clerk_user_id: event.data.id,
    },
  })

  if (ledger.processed) {
    return { ok: true as const, ignored: true as const, reason: "Already processed." }
  }

  try {
    if (event.type === "user.deleted") {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
          where: { clerkUserId: event.data.id },
          data: { status: "disabled" },
        })

        const user = await tx.user.findUnique({
          where: { clerkUserId: event.data.id },
          select: { id: true },
        })

        await tx.auditEvent.create({
          data: {
            eventName: "user.deleted",
            actorType: "auth_provider",
            entityType: "user",
            entityId: user?.id ?? event.data.id,
            metadata: {
              clerk_user_id: event.data.id,
              local_user_updated: updated.count > 0,
            },
          },
        })
      })
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true as const, ignored: false as const }
    }

    if (event.type !== "user.created" && event.type !== "user.updated") {
      await markProviderWebhookIgnored(ledger.id, "Unsupported Clerk event type.")
      return { ok: true as const, ignored: true as const, reason: "Unsupported event type." }
    }

    const email = extractClerkUserEmail(event.data)
    const phone = extractClerkUserPhone(event.data)
    const displayName = extractClerkDisplayName(event.data)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { clerkUserId: event.data.id },
        create: {
          clerkUserId: event.data.id,
          email: email ?? null,
          phone: phone ?? null,
          displayName: displayName ?? null,
          status: "active",
        },
        update: {
          email: email ?? null,
          phone: phone ?? null,
          displayName: displayName ?? null,
        },
      })

      await tx.verificationProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      })

      await tx.auditEvent.create({
        data: {
          eventName: event.type === "user.created" ? "user.created" : "user.updated",
          actorType: "auth_provider",
          entityType: "user",
          entityId: user.id,
          metadata: {
            clerk_user_id: event.data.id,
          },
        },
      })
    })

    await markProviderWebhookProcessed(ledger.id)
    return { ok: true as const, ignored: false as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Clerk webhook processing failed."
    await markProviderWebhookFailed(ledger.id, message)
    return { ok: false as const, message }
  }
}

export async function handleClerkWebhook(event: unknown) {
  return processClerkWebhookEvent(event as ClerkWebhookEvent)
}

export async function ensureLocalUserForSession() {
  const clerkUser = await getClerkCurrentUser()
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
