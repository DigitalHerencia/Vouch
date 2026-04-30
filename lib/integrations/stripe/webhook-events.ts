import "server-only"

import type Stripe from "stripe"

import { getStripeClient } from "@/lib/integrations/stripe/client"
import { getStripeRuntimeConfig } from "@/lib/integrations/stripe/config"

export type StripeWebhookVerificationResult =
  | { ok: true; event: Stripe.Event }
  | { ok: false; status: 400; message: string }

export async function verifyStripeWebhookEvent(
  rawBody: string,
  signatureHeader: string | null
): Promise<StripeWebhookVerificationResult> {
  if (!signatureHeader) {
    return { ok: false, status: 400, message: "Missing Stripe signature." }
  }

  const { webhookSecret } = getStripeRuntimeConfig()
  const stripe = getStripeClient()

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret)
    return { ok: true, event }
  } catch {
    return { ok: false, status: 400, message: "Invalid Stripe webhook signature." }
  }
}

export function isStripePaymentIntentEvent(event: Stripe.Event): boolean {
  return event.type.startsWith("payment_intent.")
}

export function isStripeRefundEvent(event: Stripe.Event): boolean {
  return event.type.startsWith("charge.refund") || event.type.startsWith("refund.")
}

export function isStripeAccountEvent(event: Stripe.Event): boolean {
  return event.type.startsWith("account.")
}

export function isStripeIdentityEvent(event: Stripe.Event): boolean {
  return event.type.startsWith("identity.verification_session.")
}
