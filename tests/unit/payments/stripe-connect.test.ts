import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createAccount = vi.fn()
const createAccountLink = vi.fn()
const retrieveAccount = vi.fn()
const updateAccount = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    v2: {
      core: {
        accounts: {
          create: createAccount,
          retrieve: retrieveAccount,
          update: updateAccount,
        },
        accountLinks: {
          create: createAccountLink,
        },
      },
    },
  }),
}))

describe("Stripe Connect Accounts v2", () => {
  beforeEach(() => {
    createAccount.mockReset()
    createAccountLink.mockReset()
    retrieveAccount.mockReset()
    updateAccount.mockReset()
    createAccount.mockResolvedValue({ id: "acct_connected" })
    createAccountLink.mockResolvedValue({ url: "https://connect.stripe.test/onboard" })
    updateAccount.mockResolvedValue({})
    retrieveAccount.mockResolvedValue({
      configuration: {
        merchant: {
          capabilities: {
            card_payments: {
              status: "active",
            },
            stripe_balance: {
              payouts: {
                status: "active",
              },
            },
          },
        },
      },
    })
  })

  it("creates connected accounts with the blueprint include fields", async () => {
    const { createStripeConnectAccount } = await import("@/lib/integrations/stripe/connect")

    await createStripeConnectAccount({
      userId: "user_merchant",
      email: "merchant@example.com",
      displayName: "Merchant",
      country: "US",
      idempotencyKey: "idem_account",
    })

    expect(createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: {
          customer: {},
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
              stripe_balance: {
                payouts: {
                  requested: true,
                },
              },
            },
          },
        },
        display_name: "Merchant",
        contact_email: "merchant@example.com",
        defaults: {
          responsibilities: {
            losses_collector: "application",
            fees_collector: "application",
          },
        },
        dashboard: "express",
        include: [
          "configuration.merchant",
          "identity",
          "defaults",
          "configuration.customer",
        ],
        identity: {
          country: "US",
        },
      }),
      { idempotencyKey: "idem_account" }
    )
  })

  it("creates onboarding links for customer and merchant configurations", async () => {
    const { createStripeConnectOnboardingLink } = await import("@/lib/integrations/stripe/connect")

    await createStripeConnectOnboardingLink({
      providerAccountId: "acct_connected",
      refreshUrl: "https://vouch.test/settings/payout",
      returnUrl: "https://vouch.test/settings/payout/return",
      idempotencyKey: "idem_link",
    })

    expect(updateAccount).toHaveBeenCalledWith(
      "acct_connected",
      {
        configuration: {
          customer: {},
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
              stripe_balance: {
                payouts: {
                  requested: true,
                },
              },
            },
          },
        },
        include: ["configuration.merchant", "configuration.customer"],
      },
      { idempotencyKey: "idem_link:configurations" }
    )

    expect(createAccountLink).toHaveBeenCalledWith(
      {
        account: "acct_connected",
        use_case: {
          type: "account_onboarding",
          account_onboarding: {
            configurations: ["merchant", "customer"],
            refresh_url: "https://vouch.test/settings/payout",
            return_url: "https://vouch.test/settings/payout/return",
          },
        },
      },
      { idempotencyKey: "idem_link" }
    )
  })

  it("maps nested merchant payout capability status to payout readiness", async () => {
    const { refreshStripeConnectReadiness } = await import("@/lib/integrations/stripe/connect")

    await expect(
      refreshStripeConnectReadiness({ providerAccountId: "acct_connected" })
    ).resolves.toEqual({
      readiness: "ready",
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      requirementsCurrentlyDue: [],
      requirementsEventuallyDue: [],
      disabledReason: null,
    })

    expect(retrieveAccount).toHaveBeenCalledWith("acct_connected", {
      include: ["configuration.merchant", "requirements"],
    })
  })

  it("maps restricted transfer capability status to restricted payout readiness", async () => {
    const { refreshStripeConnectReadiness } = await import("@/lib/integrations/stripe/connect")

    retrieveAccount.mockResolvedValueOnce({
      configuration: {
        merchant: {
          capabilities: {
            card_payments: {
              status: "restricted",
            },
            stripe_balance: {
              payouts: {
                status: "restricted",
              },
            },
          },
        },
      },
    })

    await expect(
      refreshStripeConnectReadiness({ providerAccountId: "acct_restricted" })
    ).resolves.toMatchObject({
      readiness: "restricted",
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    })
  })
})
