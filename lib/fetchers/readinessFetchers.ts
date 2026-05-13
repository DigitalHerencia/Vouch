import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { prisma } from "@/lib/db/prisma"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getStripeCustomerPaymentReadiness } from "@/lib/integrations/stripe/customers"
import { refreshStripeConnectReadiness } from "@/lib/integrations/stripe/connect"

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

const readinessSelect = {
  id: true,
  status: true,
  verificationProfile: { select: { identityStatus: true, adultStatus: true } },
  paymentCustomer: { select: { providerCustomerId: true, readiness: true } },
  connectedAccount: { select: { providerAccountId: true, readiness: true } },
  termsAcceptances: {
    orderBy: { acceptedAt: "desc" },
    take: 1,
    select: { termsVersion: true, acceptedAt: true },
  },
} satisfies Prisma.UserSelect

type ReadinessRecord = Prisma.UserGetPayload<{ select: typeof readinessSelect }>

function normalizeReadiness(record: ReadinessRecord | null) {
  const terms = record?.termsAcceptances?.[0] ?? null
  const verification = record?.verificationProfile ?? null
  const paymentCustomer = record?.paymentCustomer ?? null
  const connectedAccount = record?.connectedAccount ?? null

  const state = {
    userId: record?.id ?? null,
    userStatus: record?.status ?? "disabled",
    identityStatus: verification?.identityStatus ?? "unstarted",
    adultStatus: verification?.adultStatus ?? "unstarted",
    paymentReadiness: paymentCustomer?.readiness ?? "not_started",
    payoutReadiness: connectedAccount?.readiness ?? "not_started",
    hasPaymentCustomer: Boolean(paymentCustomer),
    hasConnectedAccount: Boolean(connectedAccount),
    termsAccepted: Boolean(terms),
    termsVersion: terms?.termsVersion ?? null,
    termsAcceptedAt: iso(terms?.acceptedAt),
  }

  return {
    ...state,
    createReady:
      state.userStatus === "active" &&
      state.paymentReadiness === "ready",
    acceptReady:
      state.userStatus === "active" &&
      state.identityStatus === "verified" &&
      state.adultStatus === "verified" &&
      state.payoutReadiness === "ready" &&
      state.termsAccepted,
    confirmReady: state.userStatus === "active",
  }
}

async function readReadiness(userId: string) {
  noStore()
  await refreshProviderReadiness(userId)
  return normalizeReadiness(await prisma.user.findUnique({ where: { id: userId }, select: readinessSelect }))
}

async function refreshProviderReadiness(userId: string) {
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      paymentCustomer: { select: { providerCustomerId: true } },
      connectedAccount: { select: { providerAccountId: true } },
    },
  })

  const paymentCustomerId = record?.paymentCustomer?.providerCustomerId
  const connectedAccountId = record?.connectedAccount?.providerAccountId

  const [payment, payout] = await Promise.all([
    paymentCustomerId ? getStripeCustomerPaymentReadiness(paymentCustomerId) : null,
    connectedAccountId ? refreshStripeConnectReadiness({ providerAccountId: connectedAccountId }) : null,
  ])

  await prisma.$transaction(async (tx) => {
    if (paymentCustomerId && payment) {
      await tx.paymentCustomer.updateMany({
        where: { userId, providerCustomerId: paymentCustomerId },
        data: { readiness: payment.readiness, lastProviderSyncAt: new Date() },
      })
    }

    if (connectedAccountId && payout) {
      await tx.connectedAccount.updateMany({
        where: { userId, providerAccountId: connectedAccountId },
        data: {
          readiness: payout.readiness,
          chargesEnabled: payout.chargesEnabled,
          payoutsEnabled: payout.payoutsEnabled,
          detailsSubmitted: payout.detailsSubmitted,
          lastProviderSyncAt: new Date(),
        },
      })
    }
  })
}

function blockersFor(
  kind: "create" | "accept" | "confirm",
  readiness: ReturnType<typeof normalizeReadiness>
) {
  const blockers: string[] = []

  if (readiness.userStatus !== "active") blockers.push("account_inactive")
  if (kind !== "confirm") {
    if (kind === "accept" && readiness.identityStatus !== "verified") {
      blockers.push("identity_verification_required")
    }
    if (kind === "accept" && readiness.adultStatus !== "verified") {
      blockers.push("adult_verification_required")
    }
    if (kind === "accept" && !readiness.termsAccepted) blockers.push("terms_acceptance_required")
  }
  if (kind === "create" && readiness.paymentReadiness !== "ready") {
    blockers.push("payment_method_required")
  }
  if (kind === "accept" && readiness.payoutReadiness !== "ready") {
    blockers.push("payout_method_required")
  }

  return blockers
}

export async function getAccountReadiness(userId: string) {
  const current = await requireActiveUser()
  if (current.id !== userId) return null
  return readReadiness(userId)
}

export async function getCreateVouchReadinessGate(userId: string) {
  const readiness = await getAccountReadiness(userId)
  if (!readiness) return { allowed: false, blockers: ["unauthorized"] }
  const blockers = blockersFor("create", readiness)
  return { allowed: blockers.length === 0, blockers, readiness }
}

export async function assertCreateVouchReadinessReady(userId: string) {
  const gate = await getCreateVouchReadinessGate(userId)
  if (!gate.allowed) throw new Error(`READINESS_BLOCKED: ${gate.blockers.join(",")}`)
  return { ok: true as const, blockers: [] as string[] }
}

export async function getAcceptVouchReadinessGate(input: { userId: string }) {
  const readiness = await getAccountReadiness(input.userId)
  if (!readiness) return { allowed: false, blockers: ["unauthorized"] }
  const blockers = blockersFor("accept", readiness)
  return { allowed: blockers.length === 0, blockers, readiness }
}

export async function assertAcceptVouchReadinessReady(userId: string) {
  const gate = await getAcceptVouchReadinessGate({ userId })
  if (!gate.allowed) throw new Error(`READINESS_BLOCKED: ${gate.blockers.join(",")}`)
  return { ok: true as const, blockers: [] as string[] }
}
