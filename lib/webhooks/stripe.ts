import "server-only"

import type Stripe from "stripe"

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
import {
  markCustomerDepositAuthorized,
  markProtocolFeePaidAndIssueAuthorizationCheckout,
} from "@/lib/actions/vouchActions"
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
    isStripePaymentIntentEvent(event) ||
    isStripeCheckoutSessionEvent(event) ||
    isStripeRefundEvent(event) ||
    isStripeSetupIntentEvent(event) ||
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
  if (session.mode === "setup" && session.metadata?.payment_role === "customer_payment_method_setup") {
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
  const paymentIntentId = getStripeId(session.payment_intent)
  const customerId = getStripeId(session.customer)

  const result =
    paymentRole === "merchant_creation_fee"
      ? await markProtocolFeePaidAndIssueAuthorizationCheckout({
          vouchId,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
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

    await processSupportedStripeEvent(event)

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
