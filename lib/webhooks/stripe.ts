import "server-only"

import { prisma } from "@/lib/db/prisma"
import {
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
} from "@/lib/db/transactions/webhookTransactions"
import {
  isStripeAccountEvent,
  isStripeCheckoutSessionEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
  isStripeSetupIntentEvent,
  type StripeWebhookEvent,
} from "@/lib/integrations/stripe/webhook-events"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-resultTypes"

type WebhookProcessResult = {
  providerWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
  duplicate?: boolean
}

function isSupportedStripeEvent(event: StripeWebhookEvent): boolean {
  return (
    isStripePaymentIntentEvent(event) ||
    isStripeCheckoutSessionEvent(event) ||
    isStripeRefundEvent(event) ||
    isStripeSetupIntentEvent(event) ||
    isStripeAccountEvent(event)
  )
}

export async function processStripeWebhookEvent(
  event: StripeWebhookEvent
): Promise<ActionResult<WebhookProcessResult>> {
  const ledger = await prisma.$transaction((tx) =>
    recordProviderWebhookReceivedTx(tx, {
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      safeMetadata: { livemode: "livemode" in event ? event.livemode : undefined },
    })
  )

  if (ledger.duplicate && ledger.event.processed) {
    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: false,
      duplicate: true,
    })
  }

  try {
    if (!isSupportedStripeEvent(event)) {
      await prisma.$transaction((tx) =>
        markProviderWebhookIgnoredTx(tx, {
          id: ledger.event.id,
          reason: "Unsupported Stripe event type.",
        })
      )

      return actionSuccess({
        providerWebhookEventId: ledger.event.id,
        providerEventId: ledger.event.providerEventId,
        eventType: ledger.event.eventType,
        processed: false,
      })
    }

    await prisma.$transaction((tx) => markProviderWebhookProcessedTx(tx, { id: ledger.event.id }))

    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: true,
    })
  } catch (error) {
    await prisma.$transaction((tx) =>
      markProviderWebhookFailedTx(tx, {
        id: ledger.event.id,
        error: error instanceof Error ? error.message : String(error),
      })
    )

    return actionFailure("WEBHOOK_PROCESSING_FAILED", "Stripe webhook processing failed.")
  }
}
