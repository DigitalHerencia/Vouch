import { describe, expect, it } from "vitest"

import {
  isStripeAccountEvent,
  isStripePaymentIntentEvent,
  isStripeRefundEvent,
  isStripeSetupIntentEvent,
} from "@/lib/integrations/stripe/webhook-events"

function event(type: string) {
  return { type } as never
}

describe("Stripe webhook event classifiers", () => {
  it("classifies required payment lifecycle events", () => {
    expect(isStripePaymentIntentEvent(event("payment_intent.amount_capturable_updated"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.succeeded"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.canceled"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.payment_failed"))).toBe(true)
  })

  it("classifies setup, refund, and connected account events", () => {
    expect(isStripeSetupIntentEvent(event("setup_intent.succeeded"))).toBe(true)
    expect(isStripeSetupIntentEvent(event("setup_intent.setup_failed"))).toBe(true)
    expect(isStripeRefundEvent(event("charge.refunded"))).toBe(true)
    expect(isStripeRefundEvent(event("refund.updated"))).toBe(true)
    expect(isStripeAccountEvent(event("account.updated"))).toBe(true)
  })
})
