import "server-only"

import type { PayoutReadinessStatus } from "@/types/setup"

import { getStripeServerClient } from "./client"

type StripeV2Account = {
  id: string
}

type StripeV2AccountLink = {
  url: string
}

type StripeV2Client = {
  v2?: {
    core?: {
      accounts?: {
        create(input: unknown, options?: { idempotencyKey?: string }): Promise<StripeV2Account>
        retrieve(id: string, options?: { expand?: string[]; include?: string[] }): Promise<unknown>
      }
      accountLinks?: {
        create(input: unknown, options?: { idempotencyKey?: string }): Promise<StripeV2AccountLink>
      }
    }
  }
}

function getStripeV2Core() {
  const stripe = getStripeServerClient() as unknown as StripeV2Client
  const core = stripe.v2?.core

  if (!core?.accounts || !core.accountLinks) {
    throw new Error("STRIPE_ACCOUNTS_V2_UNAVAILABLE")
  }

  return core as {
    accounts: NonNullable<NonNullable<StripeV2Client["v2"]>["core"]>["accounts"] & {}
    accountLinks: NonNullable<NonNullable<StripeV2Client["v2"]>["core"]>["accountLinks"] & {}
  }
}

export async function createStripeConnectAccount(input: {
  userId: string
  email?: string | null
  displayName?: string | null
  country?: string
  idempotencyKey?: string
}): Promise<{ providerAccountId: string }> {
  const core = getStripeV2Core()
  const account = await core.accounts.create(
    {
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: {
                requested: true,
              },
            },
          },
        },
      },
      display_name: input.displayName ?? "Vouch participant",
      contact_email: input.email ?? undefined,
      defaults: {
        responsibilities: {
          losses_collector: "application",
          fees_collector: "application",
        },
      },
      dashboard: "express",
      identity: {
        country: input.country ?? "US",
      },
      metadata: {
        vouch_user_id: input.userId,
      },
    },
    { idempotencyKey: input.idempotencyKey ?? `user:${input.userId}:connect_account` }
  )

  return { providerAccountId: account.id }
}

export async function createStripeConnectOnboardingLink(input: {
  providerAccountId: string
  refreshUrl: string
  returnUrl: string
  idempotencyKey?: string
}): Promise<{ url: string }> {
  const core = getStripeV2Core()
  const link = await core.accountLinks.create(
    {
      account: input.providerAccountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: input.refreshUrl,
          return_url: input.returnUrl,
        },
      },
    },
    { idempotencyKey: input.idempotencyKey ?? `account:${input.providerAccountId}:onboarding` }
  )

  return { url: link.url }
}

export async function refreshStripeConnectReadiness(input: {
  providerAccountId: string
}): Promise<{
  readiness: PayoutReadinessStatus
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}> {
  const core = getStripeV2Core()
  const account = (await core.accounts.retrieve(input.providerAccountId, {
    include: ["configuration.recipient"],
  })) as Record<string, unknown>

  const configuration = account.configuration as Record<string, unknown> | undefined
  const recipient = configuration?.recipient as Record<string, unknown> | undefined
  const status = recipient?.status
  const detailsSubmitted = status === "active" || status === "enabled"
  const payoutsEnabled = detailsSubmitted
  const chargesEnabled = detailsSubmitted

  return {
    readiness: detailsSubmitted ? "ready" : "requires_action",
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
  }
}
