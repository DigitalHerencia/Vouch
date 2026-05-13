import "server-only"

import type Stripe from "stripe"

import { getStripeServerClient } from "./client"

export type CreateStripePaymentAuthorizationInput = {
  vouchId: string
  customerTotalCents: number
  currency: string
  applicationFeeAmountCents: number
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  providerCustomerId?: string
  providerPaymentMethodId?: string
  connectedAccountId: string
  confirmOffSession?: boolean
  idempotencyKey: string
}

export async function createStripePaymentAuthorization(
  input: CreateStripePaymentAuthorizationInput
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServerClient()

  return stripe.paymentIntents.create(
    {
      amount: input.customerTotalCents,
      currency: input.currency,
      capture_method: "manual",
      payment_method_types: ["card"],
      ...(input.providerCustomerId ? { customer: input.providerCustomerId } : {}),
      ...(input.providerPaymentMethodId ? { payment_method: input.providerPaymentMethodId } : {}),
      ...(input.confirmOffSession && input.providerPaymentMethodId
        ? { confirm: true, off_session: true }
        : {}),
      application_fee_amount: input.applicationFeeAmountCents,
      transfer_data: { destination: input.connectedAccountId },
      metadata: {
        vouch_id: input.vouchId,
        payment_role: "customer_commitment",
        protected_amount_cents: String(input.protectedAmountCents),
        merchant_receives_cents: String(input.merchantReceivesCents),
        vouch_service_fee_cents: String(input.vouchServiceFeeCents),
        processing_fee_offset_cents: String(input.processingFeeOffsetCents),
        application_fee_amount_cents: String(input.applicationFeeAmountCents),
        customer_total_cents: String(input.customerTotalCents),
      },
    },
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function retrieveStripePaymentIntent(input: {
  providerPaymentIntentId: string
}): Promise<Stripe.PaymentIntent> {
  return getStripeServerClient().paymentIntents.retrieve(input.providerPaymentIntentId, {
    expand: ["latest_charge"],
  })
}

export async function captureStripePayment(input: {
  providerPaymentIntentId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServerClient()
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
  })

  if (current.status !== "requires_capture") {
    return current
  }

  return stripe.paymentIntents.capture(input.providerPaymentIntentId, undefined, {
    idempotencyKey: input.idempotencyKey,
  })
}

export async function cancelStripeAuthorization(input: {
  providerPaymentIntentId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServerClient()
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
  })

  if (current.status === "canceled" || current.status === "succeeded") {
    return current
  }

  return stripe.paymentIntents.cancel(
    input.providerPaymentIntentId,
    {},
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function refundStripePayment(input: {
  providerPaymentIntentId: string
  idempotencyKey: string
}): Promise<Stripe.Refund> {
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
  })

  if (current.status !== "succeeded") {
    throw new Error("PAYMENT_INTENT_NOT_CAPTURED")
  }

  return getStripeServerClient().refunds.create(
    { payment_intent: input.providerPaymentIntentId },
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function retrieveStripeRefund(input: {
  providerRefundId: string
}): Promise<Stripe.Refund> {
  return getStripeServerClient().refunds.retrieve(input.providerRefundId)
}

/**
 * Compatibility alias retained for older imports.
 */
export const voidStripeAuthorization = cancelStripeAuthorization
