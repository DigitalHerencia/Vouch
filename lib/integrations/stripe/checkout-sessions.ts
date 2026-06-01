import "server-only"

import type Stripe from "stripe"

import type { VouchPricing } from "@/lib/vouch/fees"

import { getStripeServerClient } from "./client"

function pricingMetadata(input: { vouchId: string; pricing: VouchPricing }) {
  return {
    vouch_id: input.vouchId,
    payment_role: "customer_commitment",
    protected_amount_cents: String(input.pricing.protectedAmountCents),
  }
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
      ...(input.providerCustomerId ? { customer: input.providerCustomerId } : {}),
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
        transfer_data: {
          destination: input.connectedAccountId,
        },
        metadata,
      },
      metadata,
    },
    { idempotencyKey: input.idempotencyKey }
  )
}
