import "server-only"

import type Stripe from "stripe"

import type { VouchPricing } from "@/lib/vouch/fees"

import { getStripeServerClient } from "./client"

export type CreateStripeCheckoutAuthorizationInput = {
  vouchId: string
  pricing: VouchPricing
  currency: string
  connectedAccountId: string
  providerCustomerId?: string
  successUrl: string
  cancelUrl?: string
  idempotencyKey: string
}

function pricingMetadata(input: { vouchId: string; pricing: VouchPricing }) {
  return {
    vouch_id: input.vouchId,
    payment_role: "customer_commitment",
    protected_amount_cents: String(input.pricing.protectedAmountCents),
    merchant_receives_cents: String(input.pricing.merchantReceivesCents),
    vouch_service_fee_cents: String(input.pricing.vouchServiceFeeCents),
    processing_fee_offset_cents: String(input.pricing.processingFeeOffsetCents),
    application_fee_amount_cents: String(input.pricing.applicationFeeAmountCents),
    customer_total_cents: String(input.pricing.customerTotalCents),
  }
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
            unit_amount: input.pricing.customerTotalCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual",
        application_fee_amount: input.pricing.applicationFeeAmountCents,
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
