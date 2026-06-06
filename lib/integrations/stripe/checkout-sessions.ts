import "server-only"

import type Stripe from "stripe"

import type { VouchPricing } from "@/lib/vouch/fees"

import { getStripeServerClient } from "./client"

type CreateStripeMerchantCreationFeeCheckoutInput = {
  vouchId: string
  merchantUserId: string
  feeAmountCents: number
  protectedAmountCents: number
  currency: string
  expiresAt: Date
  successUrl: string
  cancelUrl: string
  providerCustomerId?: string
  idempotencyKey: string
}

type CreateStripePaymentMethodSetupCheckoutInput = {
  providerCustomerId: string
  userId: string
  currency: string
  successUrl: string
  cancelUrl: string
  idempotencyKey: string
}

type CreateStripeCheckoutAuthorizationInput = {
  vouchId: string
  pricing: VouchPricing
  currency: string
  connectedAccountId: string
  expiresAt: Date
  successUrl: string
  cancelUrl?: string
  idempotencyKey: string
}

function pricingMetadata(input: { vouchId: string; pricing: VouchPricing }) {
  return {
    vouch_id: input.vouchId,
    payment_role: "customer_commitment",
    protected_amount_cents: String(input.pricing.protectedAmountCents),
  }
}

function toCheckoutExpiration(expiresAt: Date): number {
  const earliestAllowed = Date.now() + 30 * 60 * 1000
  const latestAllowed = Date.now() + 24 * 60 * 60 * 1000
  return Math.floor(Math.max(earliestAllowed, Math.min(expiresAt.getTime(), latestAllowed)) / 1000)
}

export async function createStripeMerchantCreationFeeCheckout(
  input: CreateStripeMerchantCreationFeeCheckoutInput
): Promise<Stripe.Checkout.Session> {
  const metadata = {
    vouch_id: input.vouchId,
    merchant_user_id: input.merchantUserId,
    payment_role: "merchant_creation_fee",
    protected_amount_cents: String(input.protectedAmountCents),
    merchant_fee_cents: String(input.feeAmountCents),
  }

  return getStripeServerClient().checkout.sessions.create(
    {
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: toCheckoutExpiration(input.expiresAt),
      ...(input.providerCustomerId ? { customer: input.providerCustomerId } : {}),
      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: { name: "Vouch protocol fee" },
            unit_amount: input.feeAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Protocol fees must settle synchronously before Vouch activation.
      payment_method_types: ["card"],
      payment_intent_data: { metadata },
      metadata,
    },
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function createStripePaymentMethodSetupCheckout(
  input: CreateStripePaymentMethodSetupCheckoutInput
): Promise<Stripe.Checkout.Session> {
  return getStripeServerClient().checkout.sessions.create(
    {
      customer: input.providerCustomerId,
      mode: "setup",
      currency: input.currency,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        vouch_user_id: input.userId,
        payment_role: "customer_payment_method_setup",
      },
      setup_intent_data: {
        metadata: {
          vouch_user_id: input.userId,
          payment_role: "customer_payment_method_setup",
        },
      },
    },
    { idempotencyKey: input.idempotencyKey }
  )
}

export async function createStripeCheckoutAuthorization(
  input: CreateStripeCheckoutAuthorizationInput
): Promise<Stripe.Checkout.Session> {
  const metadata = pricingMetadata({ vouchId: input.vouchId, pricing: input.pricing })

  return getStripeServerClient().checkout.sessions.create(
    {
      success_url: input.successUrl,
      ...(input.cancelUrl ? { cancel_url: input.cancelUrl } : {}),
      expires_at: toCheckoutExpiration(input.expiresAt),
      // Customers are account-scoped. This direct-charge Checkout runs on the merchant
      // account, so a platform Customer ID must never be supplied here.
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: input.currency,
            product_data: {
              name: "Vouch protected appointment",
            },
            unit_amount: input.pricing.protectedAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual",
        setup_future_usage: "off_session",
        metadata,
      },
      metadata,
    },
    { idempotencyKey: input.idempotencyKey, stripeAccount: input.connectedAccountId }
  )
}

export async function retrieveStripeAuthorizationCheckout(input: {
  checkoutSessionId: string
  connectedAccountId: string
}): Promise<Stripe.Checkout.Session> {
  return getStripeServerClient().checkout.sessions.retrieve(
    input.checkoutSessionId,
    { expand: ["payment_intent"] },
    { stripeAccount: input.connectedAccountId }
  )
}
