import "server-only"

import { prisma } from "@/lib/db/prisma"
import {
  extractClerkDisplayName,
  extractClerkUserEmail,
  extractClerkUserPhone,
  type ClerkWebhookEvent,
} from "@/lib/clerk/webhook-events"
import {
  markProviderWebhookFailed,
  markProviderWebhookIgnored,
  markProviderWebhookProcessed,
  recordProviderWebhookReceived,
} from "@/lib/webhooks/provider-webhook-ledger"

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
