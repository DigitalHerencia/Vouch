import "server-only"

import type Stripe from "stripe"

import { getStripeServerClient } from "./client"

export type CreateStripePaymentAuthorizationInput = {
  vouchId: string
  amountCents: number
  currency: string
  platformFeeCents: number
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
      amount: input.amountCents + input.platformFeeCents,
      currency: input.currency,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      ...(input.providerCustomerId ? { customer: input.providerCustomerId } : {}),
      ...(input.providerPaymentMethodId ? { payment_method: input.providerPaymentMethodId } : {}),
      ...(input.confirmOffSession && input.providerPaymentMethodId
        ? { confirm: true, off_session: true }
        : {}),
      ...(input.connectedAccountId
        ? {
            application_fee_amount: input.platformFeeCents,
            transfer_data: { destination: input.connectedAccountId },
          }
        : {}),
      metadata: {
        vouch_id: input.vouchId,
        payment_role: "payer_commitment",
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
