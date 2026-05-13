import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createPaymentIntent = vi.fn()
const retrievePaymentIntent = vi.fn()
const capturePaymentIntent = vi.fn()
const cancelPaymentIntent = vi.fn()
const createRefund = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    paymentIntents: {
      create: createPaymentIntent,
      retrieve: retrievePaymentIntent,
      capture: capturePaymentIntent,
      cancel: cancelPaymentIntent,
    },
    refunds: {
      create: createRefund,
    },
  }),
}))

describe("createStripePaymentAuthorization", () => {
  beforeEach(() => {
    createPaymentIntent.mockReset()
    retrievePaymentIntent.mockReset()
    capturePaymentIntent.mockReset()
    cancelPaymentIntent.mockReset()
    createRefund.mockReset()
    createPaymentIntent.mockResolvedValue({ id: "pi_test" })
    retrievePaymentIntent.mockResolvedValue({ id: "pi_test", status: "requires_capture" })
    capturePaymentIntent.mockResolvedValue({ id: "pi_test", status: "succeeded" })
    cancelPaymentIntent.mockResolvedValue({ id: "pi_test", status: "canceled" })
    createRefund.mockResolvedValue({ id: "re_test", status: "pending" })
  })

  it("creates a card-only manual-capture destination PaymentIntent with pricing metadata", async () => {
    const { createStripePaymentAuthorization } =
      await import("@/lib/integrations/stripe/payment-intents")

    await createStripePaymentAuthorization({
      vouchId: "vouch_123",
      customerTotalCents: 10_000,
      currency: "usd",
      applicationFeeAmountCents: 0,
      protectedAmountCents: 10_000,
      merchantReceivesCents: 10_000,
      vouchServiceFeeCents: 500,
      processingFeeOffsetCents: 46,
      connectedAccountId: "acct_connected",
      idempotencyKey: "idem_123",
    })

    expect(createPaymentIntent).toHaveBeenCalledWith(
      {
        amount: 10_000,
        currency: "usd",
        capture_method: "manual",
        payment_method_types: ["card"],
        transfer_data: { destination: "acct_connected" },
        metadata: {
          vouch_id: "vouch_123",
          payment_role: "customer_commitment",
          protected_amount_cents: "10000",
          merchant_receives_cents: "10000",
          vouch_service_fee_cents: "500",
          processing_fee_offset_cents: "46",
          application_fee_amount_cents: "0",
          customer_total_cents: "10000",
        },
      },
      { idempotencyKey: "idem_123" }
    )
  })

  it("uses the accepting customer and merchant destination for authorization", async () => {
    const { createStripePaymentAuthorization } =
      await import("@/lib/integrations/stripe/payment-intents")

    await createStripePaymentAuthorization({
      vouchId: "vouch_merchant_customer",
      customerTotalCents: 10_000,
      currency: "usd",
      applicationFeeAmountCents: 0,
      protectedAmountCents: 10_000,
      merchantReceivesCents: 10_000,
      vouchServiceFeeCents: 500,
      processingFeeOffsetCents: 46,
      providerCustomerId: "cus_accepting_customer",
      providerPaymentMethodId: "pm_customer_default",
      connectedAccountId: "acct_merchant_destination",
      confirmOffSession: true,
      idempotencyKey: "idem_roles",
    })

    expect(createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10_000,
        capture_method: "manual",
        customer: "cus_accepting_customer",
        payment_method: "pm_customer_default",
        confirm: true,
        off_session: true,
        transfer_data: { destination: "acct_merchant_destination" },
      }),
      { idempotencyKey: "idem_roles" }
    )
  })

  it("retrieves provider state before settlement decisions", async () => {
    const { retrieveStripePaymentIntent } =
      await import("@/lib/integrations/stripe/payment-intents")

    await retrieveStripePaymentIntent({ providerPaymentIntentId: "pi_provider" })

    expect(retrievePaymentIntent).toHaveBeenCalledWith("pi_provider", {
      expand: ["latest_charge"],
    })
  })

  it("uses idempotency keys for capture, cancel, and refund operations", async () => {
    const { captureStripePayment, voidStripeAuthorization, refundStripePayment } =
      await import("@/lib/integrations/stripe/payment-intents")

    retrievePaymentIntent
      .mockResolvedValueOnce({ id: "pi_provider", status: "requires_capture" })
      .mockResolvedValueOnce({ id: "pi_provider", status: "requires_capture" })
      .mockResolvedValueOnce({ id: "pi_provider", status: "succeeded" })

    await captureStripePayment({
      providerPaymentIntentId: "pi_provider",
      idempotencyKey: "idem_capture",
    })
    await voidStripeAuthorization({
      providerPaymentIntentId: "pi_provider",
      idempotencyKey: "idem_cancel",
    })
    await refundStripePayment({
      providerPaymentIntentId: "pi_provider",
      idempotencyKey: "idem_refund",
    })

    expect(capturePaymentIntent).toHaveBeenCalledWith("pi_provider", undefined, {
      idempotencyKey: "idem_capture",
    })
    expect(cancelPaymentIntent).toHaveBeenCalledWith(
      "pi_provider",
      {},
      { idempotencyKey: "idem_cancel" }
    )
    expect(createRefund).toHaveBeenCalledWith(
      { payment_intent: "pi_provider" },
      { idempotencyKey: "idem_refund" }
    )
  })
})
