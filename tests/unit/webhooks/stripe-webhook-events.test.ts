import { describe, expect, it } from "vitest"

import {
  isStripeAccountEvent,
  isStripeAccountEventNotification,
  isStripePaymentIntentEvent,
} from "@/lib/integrations/stripe/webhook-events"

function event(type: string, object = "event") {
  return { object, type } as never
}

describe("Stripe webhook event classifiers", () => {
  it("classifies required payment lifecycle events", () => {
    expect(isStripePaymentIntentEvent(event("payment_intent.amount_capturable_updated"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.succeeded"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.canceled"))).toBe(true)
    expect(isStripePaymentIntentEvent(event("payment_intent.payment_failed"))).toBe(true)
  })

  it("classifies connected account events", () => {
    expect(isStripeAccountEvent(event("account.updated"))).toBe(true)
    expect(
      isStripeAccountEventNotification(
        event("v2.core.account[requirements].updated", "v2.core.event")
      )
    ).toBe(true)
  })
})
