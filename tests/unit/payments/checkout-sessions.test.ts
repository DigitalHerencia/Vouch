import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createCheckoutSession = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeClient: () => ({
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

  it("creates a manual-capture connected-account Checkout Session with pricing metadata", async () => {
    const { createStripeCheckoutAuthorization } =
      await import("@/lib/integrations/stripe/checkout-sessions")

    await createStripeCheckoutAuthorization({
      vouchId: "vouch_123",
      pricing: {
        protectedAmountCents: 10_000,
        merchantReceivesCents: 10_000,
        vouchServiceFeeCents: 500,
        customerTotalCents: 10_546,
      },
      currency: "usd",
      connectedAccountId: "acct_merchant",
      expiresAt: new Date("2026-06-05T18:00:00.000Z"),
      successUrl: "https://vouch.test/success",
      cancelUrl: "https://vouch.test/cancel",
      idempotencyKey: "idem_checkout",
    })

    expect(createCheckoutSession).toHaveBeenCalledWith(
      {
        success_url: "https://vouch.test/success",
        cancel_url: "https://vouch.test/cancel",
        customer_creation: "always",
        expires_at: expect.any(Number),
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
          setup_future_usage: "off_session",
          metadata: {
            vouch_id: "vouch_123",
            payment_role: "customer_commitment",
            protected_amount_cents: "10000",
          },
        },
        metadata: {
          vouch_id: "vouch_123",
          payment_role: "customer_commitment",
          protected_amount_cents: "10000",
        },
      },
      { idempotencyKey: "idem_checkout", stripeAccount: "acct_merchant" }
    )
  })
})
