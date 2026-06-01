import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { canCreateVouch, canAcceptVouch } from "@/lib/authz/policies"
import { prisma } from "@/lib/db/prisma"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

const readinessSelect = {
  id: true,
  status: true,
  paymentCustomer: { select: { paymentMethodReady: true } },
  connectedAccount: { select: { detailsSubmitted: true, payoutsEnabled: true } },
} satisfies Prisma.UserSelect

type ReadinessRecord = Prisma.UserGetPayload<{ select: typeof readinessSelect }>

function normalizeReadiness(record: ReadinessRecord | null) {
  const paymentCustomer = record?.paymentCustomer ?? null
  const connectedAccount = record?.connectedAccount ?? null

  const state = {
    userId: record?.id ?? null,
    userStatus: record?.status === "active" ? ("active" as const) : ("disabled" as const),
    identityStatus: "verified",
    adultStatus: "verified",
    paymentMethodReady: paymentCustomer?.paymentMethodReady ? "ready" : "not_started",
    payoutReadiness:
      connectedAccount?.detailsSubmitted && connectedAccount.payoutsEnabled
        ? "ready"
        : "not_started",
    hasPaymentCustomer: Boolean(paymentCustomer),
    hasConnectedAccount: Boolean(connectedAccount),
    termsAccepted: true,
    termsVersion: null,
    termsAcceptedAt: null,
  }

  return {
    ...state,
    createReady: canCreateVouch(state),
    acceptReady: canAcceptVouch({
      ...state,
      userId: state.userId,
      merchantId: "",
      existingCustomerId: null,
      status: "sent",
      inviteValid: true,
    }),
    confirmReady: state.userStatus === "active",
  }
}

async function readReadiness(userId: string) {
  noStore()
  return normalizeReadiness(
    await prisma.user.findUnique({ where: { id: userId }, select: readinessSelect })
  )
}

function blockersFor(
  kind: "create" | "accept" | "confirm",
  readiness: ReturnType<typeof normalizeReadiness>
) {
  const blockers: string[] = []

  if (readiness.userStatus !== "active") blockers.push("account_inactive")
  if (readiness.identityStatus !== "verified") blockers.push("identity_verification_required")
  if (readiness.adultStatus !== "verified") blockers.push("adult_verification_required")
  if (kind === "create" && readiness.payoutReadiness !== "ready") {
    blockers.push("payout_method_required")
  }
  if (kind === "create" && !readiness.termsAccepted) {
    blockers.push("terms_acceptance_required")
  }
  if (kind === "accept" && readiness.paymentMethodReady !== "ready") {
    blockers.push("payment_method_required")
  }
  if (kind === "accept" && !readiness.termsAccepted) {
    blockers.push("terms_acceptance_required")
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
