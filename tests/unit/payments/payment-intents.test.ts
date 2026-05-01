import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createPaymentIntent = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    paymentIntents: {
      create: createPaymentIntent,
    },
  }),
}))

describe("createStripePaymentAuthorization", () => {
  beforeEach(() => {
    createPaymentIntent.mockReset()
    createPaymentIntent.mockResolvedValue({ id: "pi_test" })
  })

  it("creates a card-only manual-capture destination PaymentIntent with pricing metadata", async () => {
    const { createStripePaymentAuthorization } = await import(
      "@/lib/integrations/stripe/payment-intents"
    )

    await createStripePaymentAuthorization({
      vouchId: "vouch_123",
      customerTotalCents: 10_845,
      currency: "usd",
      applicationFeeAmountCents: 845,
      protectedAmountCents: 10_000,
      merchantReceivesCents: 10_000,
      vouchServiceFeeCents: 500,
      processingFeeOffsetCents: 345,
      connectedAccountId: "acct_connected",
      idempotencyKey: "idem_123",
    })

    expect(createPaymentIntent).toHaveBeenCalledWith(
      {
        amount: 10_845,
        currency: "usd",
        capture_method: "manual",
        payment_method_types: ["card"],
        application_fee_amount: 845,
        transfer_data: { destination: "acct_connected" },
        metadata: {
          vouch_id: "vouch_123",
          payment_role: "customer_commitment",
          protected_amount_cents: "10000",
          merchant_receives_cents: "10000",
          vouch_service_fee_cents: "500",
          processing_fee_offset_cents: "345",
          application_fee_amount_cents: "845",
          customer_total_cents: "10845",
        },
      },
      { idempotencyKey: "idem_123" }
    )
  })
})
