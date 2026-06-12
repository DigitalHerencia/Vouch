import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const createAccount = vi.fn()
const createAccountLink = vi.fn()
const retrieveAccount = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeClient: () => ({
    v2: {
      core: {
        accounts: {
          create: createAccount,
          retrieve: retrieveAccount,
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
    createAccount.mockResolvedValue({ id: "acct_connected" })
    createAccountLink.mockResolvedValue({ url: "https://connect.stripe.test/onboard" })
    retrieveAccount.mockResolvedValue({
      applied_configurations: ["merchant", "customer"],
      dashboard: "full",
      defaults: {
        responsibilities: {
          losses_collector: "stripe",
          fees_collector: "stripe",
        },
      },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: {
              status: "active",
            },
            stripe_balance: { payouts: { status: "active" } },
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
            },
          },
        },
        display_name: "Merchant",
        contact_email: "merchant@example.com",
        defaults: {
          responsibilities: {
            losses_collector: "stripe",
            fees_collector: "stripe",
          },
        },
        dashboard: "full",
        include: ["configuration.merchant", "identity", "defaults", "configuration.customer"],
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

    expect(retrieveAccount).toHaveBeenCalledWith("acct_connected", {
      include: ["configuration.merchant", "configuration.customer", "defaults"],
    })

    expect(createAccountLink).toHaveBeenCalledWith(
      {
        account: "acct_connected",
        use_case: {
          type: "account_onboarding",
          account_onboarding: {
            collection_options: {
              fields: "eventually_due",
              future_requirements: "include",
            },
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
      include: ["configuration.merchant", "defaults", "requirements"],
    })
  })

  it("maps restricted transfer capability status to restricted payout readiness", async () => {
    const { refreshStripeConnectReadiness } = await import("@/lib/integrations/stripe/connect")

    retrieveAccount.mockResolvedValueOnce({
      dashboard: "full",
      defaults: {
        responsibilities: {
          losses_collector: "stripe",
          fees_collector: "stripe",
        },
      },
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
