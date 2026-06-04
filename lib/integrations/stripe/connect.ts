import "server-only"

import type { PayoutReadinessStatus } from "@/types/paymentTypes"

import { getStripeServerClient } from "./client"

type StripeV2Core = {
  accounts: {
    create(
      params: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ): Promise<{ id: string }>
    retrieve(accountId: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>
    update(
      accountId: string,
      params: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ): Promise<Record<string, unknown>>
  }
  accountLinks: {
    create(
      params: Record<string, unknown>,
      options?: { idempotencyKey?: string }
    ): Promise<{ url: string }>
  }
}

type StripeV2Client = {
  v2?: {
    core?: Partial<StripeV2Core>
  }
}

function readNestedRecord(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key]
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined
}

function readNestedString(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key]
  return typeof value === "string" ? value : undefined
}

function readNestedBoolean(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key]
  return typeof value === "boolean" ? value : undefined
}

function readStringArray(record: Record<string, unknown> | undefined, key: string): string[] {
  const value = record?.[key]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function getConnectedAccountConfiguration() {
  return {
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
  }
}

function getStripeV2Core() {
  const stripe = getStripeServerClient() as unknown as StripeV2Client
  const core = stripe.v2?.core

  if (
    !core?.accounts?.create ||
    !core.accounts.retrieve ||
    !core.accounts.update ||
    !core.accountLinks?.create
  ) {
    throw new Error("STRIPE_ACCOUNTS_V2_UNAVAILABLE")
  }

  return core as StripeV2Core
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
      configuration: getConnectedAccountConfiguration(),
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
      include: ["configuration.merchant", "identity", "defaults", "configuration.customer"],
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
  await core.accounts.update(
    input.providerAccountId,
    {
      configuration: getConnectedAccountConfiguration(),
      include: ["configuration.merchant", "configuration.customer"],
    },
    {
      idempotencyKey:
        input.idempotencyKey !== undefined
          ? `${input.idempotencyKey}:configurations`
          : `account:${input.providerAccountId}:connect_configurations`,
    }
  )

  const link = await core.accountLinks.create(
    {
      account: input.providerAccountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant", "customer"],
          refresh_url: input.refreshUrl,
          return_url: input.returnUrl,
        },
      },
    },
    { idempotencyKey: input.idempotencyKey ?? `account:${input.providerAccountId}:onboarding` }
  )

  return { url: link.url }
}

export async function createStripeConnectDashboardLink(input: {
  providerAccountId: string
}): Promise<{ url: string }> {
  const link = await getStripeServerClient().accounts.createLoginLink(input.providerAccountId)

  return { url: link.url }
}

export async function refreshStripeConnectReadiness(input: { providerAccountId: string }): Promise<{
  readiness: PayoutReadinessStatus
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirementsCurrentlyDue: string[]
  requirementsEventuallyDue: string[]
  disabledReason: string | null
}> {
  const core = getStripeV2Core()
  const account = await core.accounts.retrieve(input.providerAccountId, {
    include: ["configuration.merchant", "requirements"],
  })

  const topLevelDetailsSubmitted = readNestedBoolean(account, "details_submitted")
  const topLevelPayoutsEnabled = readNestedBoolean(account, "payouts_enabled")
  const topLevelChargesEnabled = readNestedBoolean(account, "charges_enabled")
  const configuration = account.configuration as Record<string, unknown> | undefined
  const merchant = readNestedRecord(configuration, "merchant")
  const capabilities = readNestedRecord(merchant, "capabilities")
  const cardPayments = readNestedRecord(capabilities, "card_payments")
  const stripeBalance = readNestedRecord(capabilities, "stripe_balance")
  const payouts = readNestedRecord(stripeBalance, "payouts")
  const paymentStatus =
    readNestedString(cardPayments, "status") ?? readNestedString(merchant, "status")
  const payoutStatus = readNestedString(payouts, "status")
  const requirements = readNestedRecord(account, "requirements")
  const detailsSubmitted =
    topLevelDetailsSubmitted === true || paymentStatus === "active" || paymentStatus === "enabled"
  const readiness: PayoutReadinessStatus =
    paymentStatus === "restricted" || paymentStatus === "disabled"
      ? "restricted"
      : detailsSubmitted
        ? "ready"
        : "requires_action"
  const payoutsEnabled =
    topLevelPayoutsEnabled ??
    (payoutStatus === "active" || payoutStatus === "enabled" || detailsSubmitted)
  const chargesEnabled = topLevelChargesEnabled ?? detailsSubmitted

  return {
    readiness,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    requirementsCurrentlyDue: readStringArray(requirements, "currently_due"),
    requirementsEventuallyDue: readStringArray(requirements, "eventually_due"),
    disabledReason: readNestedString(requirements, "disabled_reason") ?? null,
  }
}
