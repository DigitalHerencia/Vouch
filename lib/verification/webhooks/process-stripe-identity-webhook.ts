import "server-only"

import type Stripe from "stripe"

import { prisma } from "@/lib/db/prisma"
import {
  markProviderWebhookFailed,
  markProviderWebhookIgnored,
  markProviderWebhookProcessed,
  recordProviderWebhookReceived,
} from "@/lib/webhooks/provider-webhook-ledger"

export async function processStripeIdentityWebhookEvent(event: Stripe.Event) {
  const ledger = await recordProviderWebhookReceived({
    provider: "stripe_identity",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: { livemode: event.livemode },
  })

  if (ledger.processed) {
    return { ok: true as const, ignored: true as const, reason: "Already processed." }
  }

  try {
    if (!event.type.startsWith("identity.verification_session.")) {
      await markProviderWebhookIgnored(ledger.id, "Unsupported Stripe Identity event type.")
      return { ok: true as const, ignored: true as const, reason: "Unsupported event type." }
    }

    const session = event.data.object as Stripe.Identity.VerificationSession
    const userId = typeof session.metadata?.user_id === "string" ? session.metadata.user_id : undefined

    if (!userId) {
      await markProviderWebhookIgnored(ledger.id, "Verification session has no local user metadata.")
      return { ok: true as const, ignored: true as const, reason: "Missing user metadata." }
    }

    const status = mapStripeIdentityStatus(session.status)

    await prisma.verificationProfile.update({
      where: { userId },
      data: {
        identityStatus: status,
        adultStatus: status === "verified" ? "verified" : status,
        provider: "stripe_identity",
        providerReference: session.id,
      },
    })

    await markProviderWebhookProcessed(ledger.id)
    return { ok: true as const, ignored: false as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe Identity webhook processing failed."
    await markProviderWebhookFailed(ledger.id, message)
    return { ok: false as const, message }
  }
}

function mapStripeIdentityStatus(status: Stripe.Identity.VerificationSession["status"]) {
  switch (status) {
    case "verified":
      return "verified" as const
    case "requires_input":
      return "requires_action" as const
    case "processing":
      return "pending" as const
    case "canceled":
      return "expired" as const
    default:
      return "pending" as const
  }
}
