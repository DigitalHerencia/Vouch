import "server-only"

import type Stripe from "stripe"

import { getStripeClient } from "@/lib/integrations/stripe/client"
import { getStripeWebhookSecrets } from "@/lib/integrations/stripe/config"

export type StripeWebhookEvent = Stripe.Event
export type StripeAccountEventNotification = Stripe.V2.Core.EventNotification

type StripeWebhookVerificationResult =
  | { ok: true; event: StripeWebhookEvent | StripeAccountEventNotification }
  | { ok: false; status: 400; message: string }

export async function verifyStripeWebhookEvent(
  rawBody: string,
  signatureHeader: string | null
): Promise<StripeWebhookVerificationResult> {
  if (!signatureHeader) {
    return { ok: false, status: 400, message: "Missing Stripe signature." }
  }

  const { snapshotSecrets, thinSecrets } = getStripeWebhookSecrets()
  const stripe = getStripeClient()

  for (const secret of snapshotSecrets) {
    try {
      const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, secret)
      return { ok: true, event }
    } catch {
      // Each Stripe event source has a different signing secret.
    }
  }

  for (const secret of thinSecrets) {
    try {
      const event = await stripe.parseEventNotificationAsync(rawBody, signatureHeader, secret)
      return { ok: true, event }
    } catch {
      // Keep trying the explicitly configured event-source secrets.
    }
  }

  return { ok: false, status: 400, message: "Invalid Stripe webhook signature." }
}

export function isStripeAccountEventNotification(
  event: StripeWebhookEvent | StripeAccountEventNotification
): event is StripeAccountEventNotification {
  return event.object === "v2.core.event" && event.type.startsWith("v2.core.account")
}

export function isStripePaymentIntentEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("payment_intent.")
}

export function isStripeAccountEvent(event: StripeWebhookEvent): boolean {
  return event.type.startsWith("account.")
}
