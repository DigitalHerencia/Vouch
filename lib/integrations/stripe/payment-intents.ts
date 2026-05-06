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
  connectedAccountId?: string
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
      ...(input.connectedAccountId
        ? {
            application_fee_amount: input.applicationFeeAmountCents,
            transfer_data: { destination: input.connectedAccountId },
          }
        : {}),
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

export async function captureStripePayment(input: {
  providerPaymentId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  return getStripeServerClient().paymentIntents.capture(input.providerPaymentId, undefined, {
    idempotencyKey: input.idempotencyKey,
  })
}

export async function retrieveStripePaymentIntent(input: {
  providerPaymentId: string
}): Promise<Stripe.PaymentIntent> {
  return getStripeServerClient().paymentIntents.retrieve(input.providerPaymentId, {
    expand: ["latest_charge"],
  })
}

export async function voidStripeAuthorization(input: {
  providerPaymentId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  return getStripeServerClient().paymentIntents.cancel(
    input.providerPaymentId,
    {},
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function refundStripePayment(input: {
  providerPaymentId: string
  idempotencyKey: string
}): Promise<Stripe.Refund> {
  return getStripeServerClient().refunds.create(
    { payment_intent: input.providerPaymentId },
    { idempotencyKey: input.idempotencyKey }
  )
}
