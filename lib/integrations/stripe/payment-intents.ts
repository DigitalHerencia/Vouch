import "server-only"

import type Stripe from "stripe"

import { getStripeServerClient } from "./client"

export async function retrieveStripePaymentIntent(input: {
  providerPaymentIntentId: string
  connectedAccountId: string
}): Promise<Stripe.PaymentIntent> {
  return getStripeServerClient().paymentIntents.retrieve(
    input.providerPaymentIntentId,
    { expand: ["latest_charge"] },
    { stripeAccount: input.connectedAccountId }
  )
}

export async function captureStripePayment(input: {
  providerPaymentIntentId: string
  connectedAccountId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServerClient()
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
    connectedAccountId: input.connectedAccountId,
  })

  if (current.status !== "requires_capture") {
    return current
  }

  return stripe.paymentIntents.capture(input.providerPaymentIntentId, undefined, {
    idempotencyKey: input.idempotencyKey,
    stripeAccount: input.connectedAccountId,
  })
}

export async function cancelStripeAuthorization(input: {
  providerPaymentIntentId: string
  connectedAccountId: string
  idempotencyKey: string
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServerClient()
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
    connectedAccountId: input.connectedAccountId,
  })

  if (current.status === "canceled" || current.status === "succeeded") {
    return current
  }

  return stripe.paymentIntents.cancel(
    input.providerPaymentIntentId,
    {},
    { idempotencyKey: input.idempotencyKey, stripeAccount: input.connectedAccountId }
  )
}

export async function refundStripePayment(input: {
  providerPaymentIntentId: string
  connectedAccountId: string
  idempotencyKey: string
}): Promise<Stripe.Refund> {
  const current = await retrieveStripePaymentIntent({
    providerPaymentIntentId: input.providerPaymentIntentId,
    connectedAccountId: input.connectedAccountId,
  })

  if (current.status !== "succeeded") {
    throw new Error("PAYMENT_INTENT_NOT_CAPTURED")
  }

  return getStripeServerClient().refunds.create(
    { payment_intent: input.providerPaymentIntentId },
    { idempotencyKey: input.idempotencyKey, stripeAccount: input.connectedAccountId }
  )
}
