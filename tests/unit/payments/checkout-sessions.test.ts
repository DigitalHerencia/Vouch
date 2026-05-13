import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createCheckoutSession = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    checkout: {
      sessions: {
        create: createCheckoutSession,
      },
    },
  }),
}))

describe("createStripeCheckoutAuthorization", () => {
  beforeEach(() => {
    createCheckoutSession.mockReset()
    createCheckoutSession.mockResolvedValue({
      id: "cs_test",
      url: "https://checkout.stripe.test/session",
      payment_intent: "pi_test",
    })
  })

  it("creates a manual-capture destination Checkout Session with pricing metadata", async () => {
    const { createStripeCheckoutAuthorization } = await import(
      "@/lib/integrations/stripe/checkout-sessions"
    )

    await createStripeCheckoutAuthorization({
      vouchId: "vouch_123",
      pricing: {
        protectedAmountCents: 10_000,
        merchantReceivesCents: 10_000,
        vouchServiceFeeCents: 500,
        processingFeeOffsetCents: 46,
        applicationFeeAmountCents: 0,
        customerTotalCents: 10_000,
      },
      currency: "usd",
      connectedAccountId: "acct_merchant_destination",
      providerCustomerId: "cus_accepting_customer",
      successUrl: "https://vouch.test/success",
      cancelUrl: "https://vouch.test/cancel",
      idempotencyKey: "idem_checkout",
    })

    expect(createCheckoutSession).toHaveBeenCalledWith(
      {
        success_url: "https://vouch.test/success",
        cancel_url: "https://vouch.test/cancel",
        customer: "cus_accepting_customer",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Vouch protected appointment",
              },
              unit_amount: 10_000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        payment_intent_data: {
          capture_method: "manual",
          transfer_data: {
            destination: "acct_merchant_destination",
          },
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
      { idempotencyKey: "idem_checkout" }
    )
  })
})
