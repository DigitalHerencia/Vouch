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

function readStringArray(record: Record<string, unknown> | undefined, key: string): string[] {
  const value = record?.[key]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function readAppliedConfigurations(
  record: Record<string, unknown>
): Array<"merchant" | "customer"> {
  const configurations = readStringArray(record, "applied_configurations").filter(
    (configuration): configuration is "merchant" | "customer" =>
      configuration === "merchant" || configuration === "customer"
  )

  if (!configurations.includes("merchant")) {
    throw new Error("STRIPE_MERCHANT_CONFIGURATION_NOT_APPLIED")
  }

  return configurations
}

function assertSupportedConnectedAccount(record: Record<string, unknown>): void {
  const defaults = readNestedRecord(record, "defaults")
  const responsibilities = readNestedRecord(defaults, "responsibilities")

  if (
    readNestedString(record, "dashboard") !== "full" ||
    readNestedString(responsibilities, "fees_collector") !== "stripe" ||
    readNestedString(responsibilities, "losses_collector") !== "stripe"
  ) {
    throw new Error("STRIPE_CONNECTED_ACCOUNT_REPLACEMENT_REQUIRED")
  }
}

function getConnectedAccountConfiguration() {
  return {
    customer: {},
    merchant: {
      capabilities: {
        card_payments: {
          requested: true,
        },
      },
    },
  }
}

function readRequirementDescriptions(
  requirements: Record<string, unknown> | undefined,
  statuses: readonly string[]
): string[] {
  const entries = requirements?.entries
  if (!Array.isArray(entries)) return []

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return []

    const requirement = entry as Record<string, unknown>
    const deadline = readNestedRecord(requirement, "minimum_deadline")
    const status = readNestedString(deadline, "status")
    const description = readNestedString(requirement, "description")

    return status && description && statuses.includes(status) ? [description] : []
  })
}

function getStripeV2Core() {
  const stripe = getStripeServerClient() as unknown as StripeV2Client
  const core = stripe.v2?.core

  if (!core?.accounts?.create || !core.accounts.retrieve || !core.accountLinks?.create) {
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
          // Full Dashboard merchants own payment operations. Stripe collects processing fees
          // and connected-account losses; Vouch never becomes liable for their negative balance.
          losses_collector: "stripe",
          fees_collector: "stripe",
        },
      },
      dashboard: "full",
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
  idempotencyKey: string
}): Promise<{ url: string }> {
  const core = getStripeV2Core()
  const account = await core.accounts.retrieve(input.providerAccountId, {
    include: ["configuration.merchant", "configuration.customer", "defaults"],
  })
  assertSupportedConnectedAccount(account)
  const configurations = readAppliedConfigurations(account)

  const link = await core.accountLinks.create(
    {
      account: input.providerAccountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          collection_options: {
            fields: "eventually_due",
            future_requirements: "include",
          },
          configurations,
          refresh_url: input.refreshUrl,
          return_url: input.returnUrl,
        },
      },
    },
    { idempotencyKey: input.idempotencyKey }
  )

  return { url: link.url }
}

export async function createStripeConnectDashboardLink(input: {
  providerAccountId: string
}): Promise<{ url: string }> {
  const account = await getStripeV2Core().accounts.retrieve(input.providerAccountId, {
    include: ["defaults"],
  })
  assertSupportedConnectedAccount(account)

  // Stripe authenticates Full Dashboard merchants directly; login links are Express-only.
  return { url: "https://dashboard.stripe.com/" }
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
    include: ["configuration.merchant", "defaults", "requirements"],
  })
  assertSupportedConnectedAccount(account)

  const configuration = account.configuration as Record<string, unknown> | undefined
  const merchant = readNestedRecord(configuration, "merchant")
  const capabilities = readNestedRecord(merchant, "capabilities")
  const cardPayments = readNestedRecord(capabilities, "card_payments")
  const stripeBalance = readNestedRecord(capabilities, "stripe_balance")
  const payouts = readNestedRecord(stripeBalance, "payouts")
  const paymentStatus = readNestedString(cardPayments, "status")
  const payoutStatus = readNestedString(payouts, "status")
  const requirements = readNestedRecord(account, "requirements")
  const chargesEnabled = paymentStatus === "active"
  const payoutsEnabled = payoutStatus === "active"
  const detailsSubmitted = chargesEnabled && payoutsEnabled
  const readiness: PayoutReadinessStatus =
    paymentStatus === "restricted" || payoutStatus === "restricted"
      ? "restricted"
      : detailsSubmitted
        ? "ready"
        : "requires_action"

  return {
    readiness,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    requirementsCurrentlyDue: readRequirementDescriptions(requirements, [
      "currently_due",
      "past_due",
    ]),
    requirementsEventuallyDue: readRequirementDescriptions(requirements, ["eventually_due"]),
    disabledReason:
      paymentStatus === "restricted" || payoutStatus === "restricted"
        ? "stripe_requirements_restricted"
        : null,
  }
}
