import "server-only"

import type Stripe from "stripe"

import { verifyStripeWebhookEvent } from "@/lib/stripe/webhook-events"

export async function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null) {
  return verifyStripeWebhookEvent(rawBody, signatureHeader)
}

export function parseStripeWebhookEvent(event: Stripe.Event) {
  return event
}

export function mapStripeWebhookToPaymentUpdate(event: Stripe.Event) {
  return {
    provider: "stripe" as const,
    providerEventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
  }
}
