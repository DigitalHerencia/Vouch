import { describe, expect, it } from "vitest"

import { mapStripePaymentIntentStatus } from "@/lib/stripe/payment-status"

describe("mapStripePaymentIntentStatus", () => {
  it("maps requires_payment_method", () => {
    expect(mapStripePaymentIntentStatus("requires_payment_method")).toBe("requires_payment_method")
  })

  it("maps requires_capture to authorized", () => {
    expect(mapStripePaymentIntentStatus("requires_capture")).toBe("authorized")
  })

  it("maps succeeded to captured", () => {
    expect(mapStripePaymentIntentStatus("succeeded")).toBe("captured")
  })

  it("maps canceled to voided", () => {
    expect(mapStripePaymentIntentStatus("canceled")).toBe("voided")
  })
})
