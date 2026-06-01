import "server-only"

import type Stripe from "stripe"

import { prisma } from "@/lib/db/prisma"
import { markInvitationSentTx } from "@/lib/db/transactions/invitationTransactions"
import {
  updatePaymentProviderStateTx,
  upsertPaymentRecordTx,
} from "@/lib/db/transactions/paymentTransactions"
import {
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
} from "@/lib/db/transactions/webhookTransactions"
import { markVouchAuthorizedTx, markVouchSentTx } from "@/lib/db/transactions/vouchTransactions"
import { refreshStripeConnectReadiness } from "@/lib/integrations/stripe/connect"
import { getStripeCustomerpaymentMethodReady } from "@/lib/integrations/stripe/customers"
import { retrieveStripePaymentIntent } from "@/lib/integrations/stripe/payment-intents"
import {
  getPaymentIntentCaptureBefore,
  getPaymentIntentLatestChargeId,
  mapStripePaymentIntentSettlementStatus,
  mapStripePaymentIntentStatus,
  mapStripeRefundStatus,
} from "@/lib/integrations/stripe/status-map"
import {
  isStripeAccountEvent,
  isStripeCheckoutSessionEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
  isStripeSetupIntentEvent,
  type StripeWebhookEvent,
} from "@/lib/integrations/stripe/webhook-events"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

type WebhookProcessResult = {
  providerWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
  duplicate?: boolean
}

function mapIntentTiming(intent: Stripe.PaymentIntent) {
  const status = mapStripePaymentIntentStatus(intent.status)
  const settlementStatus = mapStripePaymentIntentSettlementStatus(intent.status)
  const now = new Date()

  return {
    status,
    settlementStatus,
    amountCapturableCents: intent.amount_capturable,
    captureBefore: getPaymentIntentCaptureBefore(intent),
    authorizedAt: intent.status === "requires_capture" ? now : null,
    capturedAt: intent.status === "succeeded" ? now : null,
    canceledAt: intent.status === "canceled" ? now : null,
    failedAt: status === "failed" ? now : null,
  }
}

export async function processStripeWebhookEvent(
  event: StripeWebhookEvent
): Promise<ActionResult<WebhookProcessResult>> {
  const ledger = await prisma.$transaction((tx) =>
    recordProviderWebhookReceivedTx(tx, {
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
    if (isStripePaymentIntentEvent(event)) {
      await reconcileStripePaymentIntentEvent(ledger.event.id, event)
    } else if (isStripeCheckoutSessionEvent(event)) {
      await reconcileStripeCheckoutSessionEvent(ledger.event.id, event)
    } else if (isStripeRefundEvent(event)) {
      await reconcileStripeRefundEvent(ledger.event.id, event)
    } else if (isStripeSetupIntentEvent(event)) {
      await reconcileStripeSetupIntentEvent(ledger.event.id, event)
    } else if (isStripeAccountEvent(event)) {
      await reconcileStripeAccountEvent(ledger.event.id, event)
    } else {
      await prisma.$transaction((tx) => markProviderWebhookIgnoredTx(tx, { id: ledger.event.id }))
    }

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

async function reconcileStripeCheckoutSessionEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const session = event.data.object as Stripe.Checkout.Session
  const paymentRole =
    typeof session.metadata?.payment_role === "string" ? session.metadata.payment_role : null

  if (paymentRole === "merchant_creation_fee") {
    const vouchId =
      typeof session.metadata?.vouch_id === "string" ? session.metadata.vouch_id : null

    if (!vouchId) {
      await prisma.$transaction(async (tx) => {
        await tx.paymentWebhookEvent.create({
          data: {
            providerEventId: event.id,
            eventType: event.type,
            providerWebhookEventId,
            processed: false,
            processedAt: new Date(),
            safeMetadata: { checkout_session_id: session.id, reason: "missing_vouch_id" },
          },
        })
        await markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
      })
      return
    }

    await prisma.$transaction(async (tx) => {
      if (event.type === "checkout.session.completed") {
        const vouch = await tx.vouch.findUnique({
          where: { id: vouchId },
          select: {
            id: true,
            status: true,
            currency: true,
            vouchServiceFeeCents: true,
            processingFeeOffsetCents: true,
            invitation: { select: { id: true } },
          },
        })

        if (vouch?.status === "draft") {
          await tx.vouch.updateMany({
            where: { id: vouchId, status: "draft" },
            data: { status: "committed", committedAt: new Date() },
          })
          await markVouchSentTx(tx, { vouchId })
          if (vouch.invitation) {
            await markInvitationSentTx(tx, { invitationId: vouch.invitation.id })
          }
        } else if (vouch?.status === "committed") {
          await markVouchSentTx(tx, { vouchId })
          if (vouch.invitation) {
            await markInvitationSentTx(tx, { invitationId: vouch.invitation.id })
          }
        }

        const merchantFeeAmountCents =
          Number(session.metadata?.merchant_fee_cents) ||
          session.amount_total ||
          (vouch ? vouch.vouchServiceFeeCents + vouch.processingFeeOffsetCents : 0)

        await upsertPaymentRecordTx(tx, {
          vouchId,
          purpose: "merchant_protocol_fee",
          providerCheckoutSessionId: session.id,
          providerPaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          status: "captured",
          settlementStatus: "captured",
          amountCents: merchantFeeAmountCents,
          currency: session.currency ?? vouch?.currency ?? "usd",
          protectedAmountCents: 0,
          merchantReceivesCents: 0,
          vouchServiceFeeCents: merchantFeeAmountCents,
          processingFeeOffsetCents: 0,
          applicationFeeAmountCents: 0,
          customerTotalCents: 0,
          capturedAt: new Date(),
        })

        await tx.auditEvent.create({
          data: {
            eventName: "vouch.created",
            actorType: "stripe",
            entityType: "Vouch",
            entityId: vouchId,
            participantSafe: true,
            metadata: {
              checkout_session_id: session.id,
              payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id,
              payment_role: paymentRole,
            },
          },
        })
      }

      await tx.paymentWebhookEvent.create({
        data: {
          providerEventId: event.id,
          eventType: event.type,
          providerWebhookEventId,
          vouchId,
          processed: true,
          processedAt: new Date(),
          safeMetadata: {
            checkout_session_id: session.id,
            payment_role: paymentRole,
            payment_status: session.payment_status,
          },
        },
      })
      await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
    })
    return
  }

  if (paymentRole === "customer_payment_method_setup") {
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id
    const readiness = customerId ? await getStripeCustomerpaymentMethodReady(customerId) : null

    await prisma.$transaction(async (tx) => {
      if (customerId && readiness) {
        await tx.paymentCustomer.updateMany({
          where: { providerCustomerId: customerId },
          data: {
            readiness: readiness.readiness,
            lastProviderSyncAt: new Date(),
          },
        })
      }

      await tx.paymentWebhookEvent.create({
        data: {
          providerEventId: event.id,
          eventType: event.type,
          providerWebhookEventId,
          processed: true,
          processedAt: new Date(),
          safeMetadata: {
            checkout_session_id: session.id,
            payment_role: paymentRole,
            payment_status: session.payment_status,
          },
        },
      })

      await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
    })
    return
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      purpose: "customer_authorization",
      OR: [
        { providerCheckoutSessionId: session.id },
        ...(paymentIntentId ? [{ providerPaymentIntentId: paymentIntentId }] : []),
      ],
    },
    select: { id: true, vouchId: true, providerCheckoutSessionId: true },
  })

  if (!paymentRecord) {
    await prisma.$transaction(async (tx) => {
      await tx.paymentWebhookEvent.create({
        data: {
          providerEventId: event.id,
          eventType: event.type,
          providerWebhookEventId,
          processed: false,
          processedAt: new Date(),
          safeMetadata: {
            checkout_session_id: session.id,
            payment_intent_id: paymentIntentId,
            reason: "payment_record_not_found",
          },
        },
      })
      await markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    })
    return
  }

  if (paymentIntentId) {
    const current = await retrieveStripePaymentIntent({ providerPaymentIntentId: paymentIntentId })
    const timing = mapIntentTiming(current)

    await prisma.$transaction(async (tx) => {
      await tx.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          providerCheckoutSessionId: session.id,
          providerPaymentIntentId: current.id,
          providerChargeId: getPaymentIntentLatestChargeId(current),
          status: timing.status,
          settlementStatus: timing.settlementStatus,
          amountCapturableCents: timing.amountCapturableCents,
          captureBefore: timing.captureBefore,
          authorizedAt: timing.authorizedAt,
          capturedAt: timing.capturedAt,
          canceledAt: timing.canceledAt,
          failedAt: timing.failedAt,
          lastProviderSyncAt: new Date(),
        },
      })

      if (current.status === "requires_capture") {
        await markVouchAuthorizedTx(tx, { vouchId: paymentRecord.vouchId })
      }

      await tx.paymentWebhookEvent.create({
        data: {
          providerEventId: event.id,
          eventType: event.type,
          providerWebhookEventId,
          vouchId: paymentRecord.vouchId,
          paymentRecordId: paymentRecord.id,
          processed: true,
          processedAt: new Date(),
          safeMetadata: {
            checkout_session_id: session.id,
            payment_intent_status: current.status,
          },
        },
      })

      await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
    })
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          providerCheckoutSessionId: session.id,
          status: event.type === "checkout.session.expired" ? "expired" : "checkout_created",
          settlementStatus: event.type === "checkout.session.expired" ? "non_captured" : "pending",
          lastProviderSyncAt: new Date(),
        },
      })

      await tx.paymentWebhookEvent.create({
        data: {
          providerEventId: event.id,
          eventType: event.type,
          providerWebhookEventId,
          vouchId: paymentRecord.vouchId,
          paymentRecordId: paymentRecord.id,
          processed: true,
          processedAt: new Date(),
          safeMetadata: { checkout_session_id: session.id },
        },
      })

      await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
    })
  }
}

async function reconcileStripePaymentIntentEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const intent = event.data.object as Stripe.PaymentIntent
  const current = await retrieveStripePaymentIntent({ providerPaymentIntentId: intent.id })
  const timing = mapIntentTiming(current)

  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: {
      providerPaymentIntentId: current.id,
      purpose: "customer_authorization",
    },
    select: { id: true, vouchId: true },
  })

  if (!paymentRecord) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    await updatePaymentProviderStateTx(tx, {
      paymentRecordId: paymentRecord.id,
      providerPaymentIntentId: current.id,
      providerChargeId: getPaymentIntentLatestChargeId(current),
      status: timing.status,
      settlementStatus: timing.settlementStatus,
      amountCapturableCents: timing.amountCapturableCents,
      captureBefore: timing.captureBefore,
      authorizedAt: timing.authorizedAt,
      capturedAt: timing.capturedAt,
      canceledAt: timing.canceledAt,
      failedAt: timing.failedAt,
    })

    await tx.paymentWebhookEvent.create({
      data: {
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: paymentRecord.vouchId,
        paymentRecordId: paymentRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: { payment_intent_status: current.status },
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}

async function reconcileStripeRefundEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const refund = event.data.object as Stripe.Refund
  const status = mapStripeRefundStatus(refund.status)

  const refundRecord = await prisma.refundRecord.findUnique({
    where: { providerRefundId: refund.id },
    select: { id: true, vouchId: true, paymentRecordId: true },
  })

  if (!refundRecord) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.refundRecord.update({
      where: { id: refundRecord.id },
      data: { status },
    })

    if (status === "succeeded") {
      await tx.paymentRecord.update({
        where: { id: refundRecord.paymentRecordId },
        data: { settlementStatus: "refunded" },
      })
    }

    await tx.paymentWebhookEvent.create({
      data: {
        providerEventId: event.id,
        eventType: event.type,
        providerWebhookEventId,
        vouchId: refundRecord.vouchId,
        refundRecordId: refundRecord.id,
        processed: true,
        processedAt: new Date(),
        safeMetadata: { refund_status: refund.status },
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}

async function reconcileStripeSetupIntentEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const setupIntent = event.data.object as Stripe.SetupIntent
  const customerId =
    typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id

  if (!customerId) {
    await prisma.$transaction((tx) =>
      markProviderWebhookIgnoredTx(tx, { id: providerWebhookEventId })
    )
    return
  }

  const readiness = await getStripeCustomerpaymentMethodReady(customerId)

  await prisma.$transaction(async (tx) => {
    await tx.paymentCustomer.updateMany({
      where: { providerCustomerId: customerId },
      data: {
        readiness: readiness.readiness,
        lastProviderSyncAt: new Date(),
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}

async function reconcileStripeAccountEvent(
  providerWebhookEventId: string,
  event: StripeWebhookEvent
) {
  const account = event.data.object as Stripe.Account
  const readiness = await refreshStripeConnectReadiness({ providerAccountId: account.id })

  await prisma.$transaction(async (tx) => {
    await tx.connectedAccount.updateMany({
      where: { providerAccountId: account.id },
      data: {
        readiness: readiness.readiness,
        chargesEnabled: readiness.chargesEnabled,
        payoutsEnabled: readiness.payoutsEnabled,
        detailsSubmitted: readiness.detailsSubmitted,
        lastProviderSyncAt: new Date(),
      },
    })

    await markProviderWebhookProcessedTx(tx, { id: providerWebhookEventId })
  })
}
