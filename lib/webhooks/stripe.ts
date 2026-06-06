import "server-only"

import type Stripe from "stripe"

import type {
  Prisma,
  StripePayoutStatus,
  StripeRefundStatus,
} from "@/prisma/generated/prisma/client"

import { prisma } from "@/lib/db/prisma"
import {
  markProviderWebhookFailedTx,
  markProviderWebhookIgnoredTx,
  markProviderWebhookProcessedTx,
  recordProviderWebhookReceivedTx,
} from "@/lib/db/transactions/webhookTransactions"
import {
  isStripeAccountEvent,
  type StripeAccountEventNotification,
  isStripePaymentIntentEvent,
  type StripeWebhookEvent,
} from "@/lib/integrations/stripe/webhook-events"
import {
  markCustomerDepositAuthorized,
  markProtocolFeePaidAndIssueAuthorizationCheckout,
  refreshCustomerDepositPaymentIntent,
} from "@/lib/vouch/workflows"
import {
  syncConnectedAccountReadinessForUser,
  syncPaymentCustomerReadinessForUser,
} from "@/lib/payments/stripeReadinessSync"
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
    event.type === "checkout.session.completed" ||
    (isStripePaymentIntentEvent(event) &&
      [
        "payment_intent.amount_capturable_updated",
        "payment_intent.canceled",
        "payment_intent.payment_failed",
        "payment_intent.processing",
        "payment_intent.succeeded",
      ].includes(event.type)) ||
    [
      "charge.captured",
      "charge.failed",
      "charge.refunded",
      "charge.succeeded",
      "charge.updated",
    ].includes(event.type) ||
    event.type.startsWith("refund.") ||
    event.type.startsWith("payout.") ||
    isStripeAccountEvent(event)
  )
}

function getStripeId(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === "string" ? id : undefined
  }

  return undefined
}

async function processCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
  accountId?: string
): Promise<void> {
  if (
    session.mode === "setup" &&
    session.metadata?.payment_role === "customer_payment_method_setup"
  ) {
    const userId = session.metadata.vouch_user_id
    const customerId = getStripeId(session.customer)
    const setupIntentId = getStripeId(session.setup_intent)

    if (userId && customerId) {
      await syncPaymentCustomerReadinessForUser({
        userId,
        stripeCustomerId: customerId,
        stripeEventId: eventId,
        ...(setupIntentId ? { setupIntentId } : {}),
      })
    }

    return
  }

  const vouchId = session.metadata?.vouch_id
  if (!vouchId) return

  const paymentRole = session.metadata?.payment_role
  // Checkout completion is not proof of payment for delayed payment methods.
  if (paymentRole === "merchant_creation_fee" && session.payment_status !== "paid") return

  const paymentIntentId = getStripeId(session.payment_intent)
  const customerId = getStripeId(session.customer)

  const result =
    paymentRole === "merchant_creation_fee"
      ? await markProtocolFeePaidAndIssueAuthorizationCheckout({
          vouchId,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          amountCents: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
        })
      : paymentRole === "customer_commitment"
        ? await markCustomerDepositAuthorized({
            vouchId,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: customerId,
            stripeAccountId: accountId,
            amountCents: session.amount_total ?? undefined,
            currency: session.currency ?? undefined,
          })
        : null

  if (!result) return

  if (!result.ok) throw new Error(result.formError ?? result.code)
}

async function processSupportedStripeEvent(event: StripeWebhookEvent): Promise<void> {
  if (event.type === "checkout.session.completed") {
    await processCheckoutSessionCompleted(
      event.data.object as Stripe.Checkout.Session,
      event.id,
      event.account
    )
  }

  if (isStripePaymentIntentEvent(event)) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const vouchId = paymentIntent.metadata.vouch_id
    const stripeAccountId = event.account

    if (
      paymentIntent.metadata.payment_role === "customer_commitment" &&
      vouchId &&
      stripeAccountId
    ) {
      await refreshCustomerDepositPaymentIntent({
        vouchId,
        stripePaymentIntentId: paymentIntent.id,
        stripeAccountId,
        stripeEventId: event.id,
      })
    }
  }

  if (isStripeAccountEvent(event)) {
    const account = event.data.object as { id?: string }
    const stripeAccountId = event.account ?? account.id
    if (!stripeAccountId) return

    const connectedAccount = await prisma.connectedAccount.findUnique({
      where: { stripeAccountId },
      select: { userId: true },
    })

    if (!connectedAccount) return

    await syncConnectedAccountReadinessForUser({
      userId: connectedAccount.userId,
      stripeAccountId,
      stripeEventId: event.id,
    })
  }

  if (
    [
      "charge.captured",
      "charge.failed",
      "charge.refunded",
      "charge.succeeded",
      "charge.updated",
    ].includes(event.type)
  ) {
    await syncChargeRecord(event.data.object as Stripe.Charge)
  }

  if (event.type.startsWith("refund.")) {
    await syncRefundRecord(event.data.object as Stripe.Refund)
  }

  if (event.type.startsWith("payout.")) {
    await syncPayoutRecord(event.data.object as Stripe.Payout, event.account)
  }
}

async function syncChargeRecord(charge: Stripe.Charge): Promise<void> {
  const stripePaymentIntentId = getStripeId(charge.payment_intent)
  const paymentIntent = stripePaymentIntentId
    ? await prisma.paymentIntentRecord.findUnique({
        where: { stripePaymentIntentId },
        select: { id: true, vouchId: true },
      })
    : null
  const stripeCustomerId = getStripeId(charge.customer)
  const stripeBalanceTransactionId = getStripeId(charge.balance_transaction)

  const data: Prisma.ChargeRecordUncheckedUpdateInput = {
    ...(paymentIntent?.vouchId ? { vouchId: paymentIntent.vouchId } : {}),
    ...(paymentIntent?.id ? { paymentIntentRecordId: paymentIntent.id } : {}),
    ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    ...(stripeCustomerId ? { stripeCustomerId } : {}),
    ...(stripeBalanceTransactionId ? { stripeBalanceTransactionId } : {}),
    amountCents: charge.amount,
    currency: charge.currency,
    status: charge.status,
    captured: charge.captured,
    paid: charge.paid,
    refunded: charge.refunded,
    disputed: charge.disputed,
    ...(charge.captured ? { capturedAt: new Date() } : {}),
  }
  const createData: Prisma.ChargeRecordUncheckedCreateInput = {
    stripeChargeId: charge.id,
    ...(paymentIntent?.vouchId ? { vouchId: paymentIntent.vouchId } : {}),
    ...(paymentIntent?.id ? { paymentIntentRecordId: paymentIntent.id } : {}),
    ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    ...(stripeCustomerId ? { stripeCustomerId } : {}),
    ...(stripeBalanceTransactionId ? { stripeBalanceTransactionId } : {}),
    amountCents: charge.amount,
    currency: charge.currency,
    status: charge.status,
    captured: charge.captured,
    paid: charge.paid,
    refunded: charge.refunded,
    disputed: charge.disputed,
    ...(charge.captured ? { capturedAt: new Date() } : {}),
  }

  await prisma.chargeRecord.upsert({
    where: { stripeChargeId: charge.id },
    create: createData,
    update: data,
  })
}

function mapRefundStatus(status: string | null): StripeRefundStatus {
  switch (status) {
    case "requires_action":
    case "succeeded":
    case "failed":
    case "canceled":
      return status
    default:
      return "pending"
  }
}

async function syncRefundRecord(refund: Stripe.Refund): Promise<void> {
  const stripePaymentIntentId = getStripeId(refund.payment_intent)
  const stripeChargeId = getStripeId(refund.charge)
  const [paymentIntent, charge] = await Promise.all([
    stripePaymentIntentId
      ? prisma.paymentIntentRecord.findUnique({
          where: { stripePaymentIntentId },
          select: { id: true, vouchId: true },
        })
      : null,
    stripeChargeId
      ? prisma.chargeRecord.findUnique({
          where: { stripeChargeId },
          select: { id: true, vouchId: true },
        })
      : null,
  ])
  const vouchId = paymentIntent?.vouchId ?? charge?.vouchId
  const data: Prisma.RefundRecordUncheckedUpdateInput = {
    ...(vouchId ? { vouchId } : {}),
    ...(charge?.id ? { chargeRecordId: charge.id } : {}),
    ...(paymentIntent?.id ? { paymentIntentRecordId: paymentIntent.id } : {}),
    ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    ...(stripeChargeId ? { stripeChargeId } : {}),
    amountCents: refund.amount,
    currency: refund.currency,
    status: mapRefundStatus(refund.status),
    syncedAt: new Date(),
  }
  const createData: Prisma.RefundRecordUncheckedCreateInput = {
    stripeRefundId: refund.id,
    ...(vouchId ? { vouchId } : {}),
    ...(charge?.id ? { chargeRecordId: charge.id } : {}),
    ...(paymentIntent?.id ? { paymentIntentRecordId: paymentIntent.id } : {}),
    ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    ...(stripeChargeId ? { stripeChargeId } : {}),
    amountCents: refund.amount,
    currency: refund.currency,
    status: mapRefundStatus(refund.status),
    syncedAt: new Date(),
  }

  await prisma.refundRecord.upsert({
    where: { stripeRefundId: refund.id },
    create: createData,
    update: data,
  })
}

function mapPayoutStatus(status: string): StripePayoutStatus {
  switch (status) {
    case "in_transit":
    case "paid":
    case "failed":
    case "canceled":
      return status
    default:
      return "pending"
  }
}

async function syncPayoutRecord(payout: Stripe.Payout, stripeAccountId?: string): Promise<void> {
  const connectedAccount = stripeAccountId
    ? await prisma.connectedAccount.findUnique({
        where: { stripeAccountId },
        select: { id: true },
      })
    : null
  const data: Prisma.PayoutRecordUncheckedUpdateInput = {
    ...(connectedAccount?.id ? { connectedAccountId: connectedAccount.id } : {}),
    ...(stripeAccountId ? { stripeAccountId } : {}),
    amountCents: payout.amount,
    currency: payout.currency,
    status: mapPayoutStatus(payout.status),
    arrivalDate: new Date(payout.arrival_date * 1000),
    ...(payout.status === "paid" ? { paidAt: new Date() } : {}),
    ...(payout.status === "failed" ? { failedAt: new Date() } : {}),
    failureCode: payout.failure_code,
    failureMessage: payout.failure_message,
    syncedAt: new Date(),
  }
  const createData: Prisma.PayoutRecordUncheckedCreateInput = {
    stripePayoutId: payout.id,
    ...(connectedAccount?.id ? { connectedAccountId: connectedAccount.id } : {}),
    ...(stripeAccountId ? { stripeAccountId } : {}),
    amountCents: payout.amount,
    currency: payout.currency,
    status: mapPayoutStatus(payout.status),
    arrivalDate: new Date(payout.arrival_date * 1000),
    ...(payout.status === "paid" ? { paidAt: new Date() } : {}),
    ...(payout.status === "failed" ? { failedAt: new Date() } : {}),
    failureCode: payout.failure_code,
    failureMessage: payout.failure_message,
    syncedAt: new Date(),
  }

  await prisma.payoutRecord.upsert({
    where: { stripePayoutId: payout.id },
    create: createData,
    update: data,
  })
}

async function recordStripeEvent(input: {
  providerWebhookEventId: string
  stripeEventId: string
  eventType: string
  accountId?: string
  livemode: boolean
  vouchId?: string
}): Promise<void> {
  await prisma.stripeWebhookEvent.upsert({
    where: { stripeEventId: input.stripeEventId },
    create: {
      providerWebhookEventId: input.providerWebhookEventId,
      stripeEventId: input.stripeEventId,
      eventType: input.eventType,
      livemode: input.livemode,
      ...(input.accountId ? { accountId: input.accountId } : {}),
      ...(input.vouchId ? { vouchId: input.vouchId } : {}),
    },
    update: {
      eventType: input.eventType,
      livemode: input.livemode,
      ...(input.accountId ? { accountId: input.accountId } : {}),
      ...(input.vouchId ? { vouchId: input.vouchId } : {}),
    },
  })
}

export async function processStripeWebhookEvent(
  event: StripeWebhookEvent
): Promise<ActionResult<WebhookProcessResult>> {
  const ledger = await recordProviderWebhookReceivedTx(prisma, {
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: { livemode: "livemode" in event ? event.livemode : undefined },
  })

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
      await markProviderWebhookIgnoredTx(prisma, {
        id: ledger.event.id,
        reason: "Unsupported Stripe event type.",
      })

      return actionSuccess({
        providerWebhookEventId: ledger.event.id,
        providerEventId: ledger.event.providerEventId,
        eventType: ledger.event.eventType,
        processed: false,
      })
    }

    await processSupportedStripeEvent(event)
    const object = event.data.object as { metadata?: { vouch_id?: string } }
    await recordStripeEvent({
      providerWebhookEventId: ledger.event.id,
      stripeEventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      ...(event.account ? { accountId: event.account } : {}),
      ...(object.metadata?.vouch_id ? { vouchId: object.metadata.vouch_id } : {}),
    })

    await markProviderWebhookProcessedTx(prisma, { id: ledger.event.id })

    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: true,
    })
  } catch (error) {
    await markProviderWebhookFailedTx(prisma, {
      id: ledger.event.id,
      error: error instanceof Error ? error.message : String(error),
    })

    return actionFailure("WEBHOOK_PROCESSING_FAILED", "Stripe webhook processing failed.")
  }
}

export async function processStripeAccountEventNotification(
  event: StripeAccountEventNotification
): Promise<ActionResult<WebhookProcessResult>> {
  const ledger = await recordProviderWebhookReceivedTx(prisma, {
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: { livemode: event.livemode },
  })

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
    const stripeAccountId =
      "related_object" in event && event.related_object?.type === "v2.core.account"
        ? event.related_object.id
        : undefined

    if (!stripeAccountId) {
      await markProviderWebhookIgnoredTx(prisma, {
        id: ledger.event.id,
        reason: "Stripe account event has no related account.",
      })
      return actionSuccess({
        providerWebhookEventId: ledger.event.id,
        providerEventId: ledger.event.providerEventId,
        eventType: ledger.event.eventType,
        processed: false,
      })
    }

    const connectedAccount = await prisma.connectedAccount.findUnique({
      where: { stripeAccountId },
      select: { userId: true },
    })

    if (connectedAccount) {
      await syncConnectedAccountReadinessForUser({
        userId: connectedAccount.userId,
        stripeAccountId,
        stripeEventId: event.id,
      })
    }

    await recordStripeEvent({
      providerWebhookEventId: ledger.event.id,
      stripeEventId: event.id,
      eventType: event.type,
      accountId: stripeAccountId,
      livemode: event.livemode,
    })
    await markProviderWebhookProcessedTx(prisma, { id: ledger.event.id })
    return actionSuccess({
      providerWebhookEventId: ledger.event.id,
      providerEventId: ledger.event.providerEventId,
      eventType: ledger.event.eventType,
      processed: true,
    })
  } catch (error) {
    await markProviderWebhookFailedTx(prisma, {
      id: ledger.event.id,
      error: error instanceof Error ? error.message : String(error),
    })
    return actionFailure("WEBHOOK_PROCESSING_FAILED", "Stripe webhook processing failed.")
  }
}
