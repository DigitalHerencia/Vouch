import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const retrievePaymentIntent = vi.fn()
const capturePaymentIntent = vi.fn()
const cancelPaymentIntent = vi.fn()
const createRefund = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    paymentIntents: {
      retrieve: retrievePaymentIntent,
      capture: capturePaymentIntent,
      cancel: cancelPaymentIntent,
    },
    refunds: {
      create: createRefund,
    },
  }),
}))

describe("Stripe PaymentIntent operations", () => {
  beforeEach(() => {
    retrievePaymentIntent.mockReset()
    capturePaymentIntent.mockReset()
    cancelPaymentIntent.mockReset()
    createRefund.mockReset()
    retrievePaymentIntent.mockResolvedValue({ id: "pi_test", status: "requires_capture" })
    capturePaymentIntent.mockResolvedValue({ id: "pi_test", status: "succeeded" })
    cancelPaymentIntent.mockResolvedValue({ id: "pi_test", status: "canceled" })
    createRefund.mockResolvedValue({ id: "re_test", status: "pending" })
  })

  it("retrieves provider state before settlement decisions", async () => {
    const { retrieveStripePaymentIntent } =
      await import("@/lib/integrations/stripe/payment-intents")

    await retrieveStripePaymentIntent({
      providerPaymentIntentId: "pi_provider",
      connectedAccountId: "acct_merchant",
    })

    expect(retrievePaymentIntent).toHaveBeenCalledWith(
      "pi_provider",
      { expand: ["latest_charge"] },
      { stripeAccount: "acct_merchant" }
    )
  })

  it("uses idempotency keys for capture, cancel, and refund operations", async () => {
    const { captureStripePayment, cancelStripeAuthorization, refundStripePayment } =
      await import("@/lib/integrations/stripe/payment-intents")

    retrievePaymentIntent
      .mockResolvedValueOnce({ id: "pi_provider", status: "requires_capture" })
      .mockResolvedValueOnce({ id: "pi_provider", status: "requires_capture" })
      .mockResolvedValueOnce({ id: "pi_provider", status: "succeeded" })

    await captureStripePayment({
      providerPaymentIntentId: "pi_provider",
      connectedAccountId: "acct_merchant",
      idempotencyKey: "idem_capture",
    })
    await cancelStripeAuthorization({
      providerPaymentIntentId: "pi_provider",
      connectedAccountId: "acct_merchant",
      idempotencyKey: "idem_cancel",
    })
    await refundStripePayment({
      providerPaymentIntentId: "pi_provider",
      connectedAccountId: "acct_merchant",
      idempotencyKey: "idem_refund",
    })

    expect(capturePaymentIntent).toHaveBeenCalledWith("pi_provider", undefined, {
      idempotencyKey: "idem_capture",
      stripeAccount: "acct_merchant",
    })
    expect(cancelPaymentIntent).toHaveBeenCalledWith(
      "pi_provider",
      {},
      { idempotencyKey: "idem_cancel", stripeAccount: "acct_merchant" }
    )
    expect(createRefund).toHaveBeenCalledWith(
      { payment_intent: "pi_provider" },
      { idempotencyKey: "idem_refund", stripeAccount: "acct_merchant" }
    )
  })
})
