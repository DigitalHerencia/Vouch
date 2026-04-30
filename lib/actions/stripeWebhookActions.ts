import "server-only"

import type Stripe from "stripe"

import { prisma } from "@/lib/db/prisma"
import { mapStripePaymentIntentStatus, mapStripeRefundStatus } from "@/lib/integrations/stripe/status-map"
import {
  isStripeAccountEvent,
  isStripeIdentityEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
} from "@/lib/integrations/stripe/webhook-events"
import {
  markProviderWebhookFailed,
  markProviderWebhookIgnored,
  markProviderWebhookProcessed,
  recordProviderWebhookReceived,
} from "@/lib/actions/webhookActions"

export type StripeWebhookProcessingResult =
  | { ok: true; status: 200; processed: true; ignored?: false }
  | { ok: true; status: 200; processed: false; ignored: true; reason: string }
  | { ok: false; status: 500; message: string }

export async function processStripeWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookProcessingResult> {
  const ledger = await recordProviderWebhookReceived({
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: {
      livemode: event.livemode,
      api_version: event.api_version,
    },
  })

  if (ledger.processed) {
    return { ok: true, status: 200, processed: false, ignored: true, reason: "Already processed." }
  }

  try {
    if (isStripeIdentityEvent(event) || isStripeAccountEvent(event)) {
      await markProviderWebhookIgnored(
        ledger.id,
        "Handled by verification/account webhook processor."
      )
      return {
        ok: true,
        status: 200,
        processed: false,
        ignored: true,
        reason: "Delegated event type.",
      }
    }

    if (isStripePaymentIntentEvent(event)) {
      await processPaymentIntentEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    if (isStripeRefundEvent(event)) {
      await processRefundEvent(event, ledger.id)
      await markProviderWebhookProcessed(ledger.id)
      return { ok: true, status: 200, processed: true }
    }

    await markProviderWebhookIgnored(ledger.id, "Unsupported Stripe event type.")
    return {
      ok: true,
      status: 200,
      processed: false,
      ignored: true,
      reason: "Unsupported event type.",
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Stripe webhook processing error."
    await markProviderWebhookFailed(ledger.id, message)
    return { ok: false, status: 500, message }
  }
}

async function processPaymentIntentEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const intent = event.data.object as Stripe.PaymentIntent
  const localStatus = mapStripePaymentIntentStatus(intent.status)

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: { providerPaymentId: intent.id },
    select: { id: true, vouchId: true },
  })

  if (!paymentRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          payment_intent: intent.id,
          reason: "No local payment record matched this provider payment ID.",
        },
      },
    })
    return
  }

  await prisma.$transaction([
    prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        status: localStatus,
        lastErrorCode: intent.last_payment_error?.code ?? null,
        lastErrorMessage: intent.last_payment_error?.message ?? null,
      },
    }),
    prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          payment_intent: intent.id,
          status: intent.status,
        },
      },
    }),
    prisma.auditEvent.create({
      data: {
        eventName: "payment.webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: event.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          payment_intent: intent.id,
          status: intent.status,
        },
      },
    }),
  ])
}

async function processRefundEvent(event: Stripe.Event, providerWebhookEventId: string) {
  const refund = event.data.object as Stripe.Refund
  const localStatus = mapStripeRefundStatus(refund.status)

  const refundRecord = await prisma.refundRecord.findFirst({
    where: { providerRefundId: refund.id },
    select: { id: true, vouchId: true, paymentRecordId: true },
  })

  if (!refundRecord) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          refund: refund.id,
          reason: "No local refund record matched this provider refund ID.",
        },
      },
    })
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.refundRecord.update({
      where: { id: refundRecord.id },
      data: { status: localStatus },
    })
    await tx.paymentRecord.update({
      where: { id: refundRecord.paymentRecordId },
      data: { status: localStatus === "succeeded" ? "refunded" : "refund_pending" },
    })
    await tx.paymentWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: refundRecord.vouchId,
        paymentRecordId: refundRecord.paymentRecordId,
        refundRecordId: refundRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: {
          refund: refund.id,
          status: refund.status,
        },
      },
    })
    await tx.auditEvent.create({
      data: {
        eventName: "payment.webhook_processed",
        actorType: "payment_provider",
        entityType: "PaymentWebhookEvent",
        entityId: event.id,
        participantSafe: false,
        metadata: {
          provider_event_id: event.id,
          event_type: event.type,
          refund: refund.id,
          status: refund.status,
        },
      },
    })
    if (localStatus === "succeeded") {
      await tx.vouch.update({
        where: { id: refundRecord.vouchId },
        data: { status: "refunded" },
      })
    }
  })
}
