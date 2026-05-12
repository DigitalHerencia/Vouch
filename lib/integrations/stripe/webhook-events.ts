import "server-only"

import type Stripe from "stripe"

import { getStripeClient } from "@/lib/integrations/stripe/client"
import { getStripeRuntimeConfig } from "@/lib/integrations/stripe/config"

export type StripeWebhookEvent = Stripe.Event | Stripe.V2.Core.EventNotification

export type StripeWebhookVerificationResult =
  | { ok: true; event: StripeWebhookEvent }
  | { ok: false; status: 400; message: string }

function isStripeV2EventNotificationPayload(rawBody: string): boolean {
  try {
    const payload = JSON.parse(rawBody) as { object?: unknown }
    return payload.object === "v2.core.event"
  } catch {
    return false
  }
}

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
    const event = isStripeV2EventNotificationPayload(rawBody)
      ? stripe.parseEventNotification(rawBody, signatureHeader, webhookSecret)
      : stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret)
    return { ok: true, event }
  } catch {
    return { ok: false, status: 400, message: "Invalid Stripe webhook signature." }
  }
}

export function isStripeV2WebhookEvent(
  event: StripeWebhookEvent
): event is Stripe.V2.Core.EventNotification {
  return event.object === "v2.core.event"
}

export function isStripePaymentIntentEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("payment_intent.")
}

export function isStripeCheckoutSessionEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("checkout.session.")
}

export function isStripeRefundEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("charge.refund") || event.type.startsWith("refund.")
}

export function isStripeSetupIntentEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("setup_intent.")
}

export function isStripeAccountEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("account.") || event.type.startsWith("v2.core.account")
}

export function isStripeIdentityEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("identity.verification_session.")
}
