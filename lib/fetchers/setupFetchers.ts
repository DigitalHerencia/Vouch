import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import { setupChecklistSelect } from "@/lib/db/selects/setup.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

type SetupChecklistRecord = Prisma.UserGetPayload<{ select: typeof setupChecklistSelect }>

function normalizeSetup(record: SetupChecklistRecord | null) {
  const terms = record?.termsAcceptances?.[0] ?? null
  const verification = record?.verificationProfile ?? null
  const paymentCustomer = record?.paymentCustomer ?? null
  const connectedAccount = record?.connectedAccount ?? null

  const state = {
    userId: record?.id ?? null,
    userStatus: record?.status ?? "disabled",
    identityStatus: verification?.identityStatus ?? "unstarted",
    adultStatus: verification?.adultStatus ?? "unstarted",
    paymentReadiness: verification?.paymentReadiness ?? "not_started",
    payoutReadiness: verification?.payoutReadiness ?? "not_started",
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
      state.identityStatus === "verified" &&
      state.adultStatus === "verified" &&
      state.paymentReadiness === "ready" &&
      state.termsAccepted,
    acceptReady:
      state.userStatus === "active" &&
      state.identityStatus === "verified" &&
      state.adultStatus === "verified" &&
      state.payoutReadiness === "ready" &&
      state.termsAccepted,
    confirmReady: state.userStatus === "active",
  }
}

async function readSetup(userId: string) {
  noStore()
  return normalizeSetup(
    await prisma.user.findUnique({
      where: { id: userId },
      select: setupChecklistSelect,
    })
  )
}

function blockersFor(
  kind: "create" | "accept" | "confirm",
  setup: ReturnType<typeof normalizeSetup>
) {
  const blockers: string[] = []

  if (setup.userStatus !== "active") blockers.push("account_disabled")

  if (kind !== "confirm") {
    if (setup.identityStatus !== "verified") blockers.push("identity_verification_required")
    if (setup.adultStatus !== "verified") blockers.push("adult_verification_required")
    if (!setup.termsAccepted) blockers.push("terms_required")
  }

  if (kind === "create" && setup.paymentReadiness !== "ready")
    blockers.push("payment_method_required")
  if (kind === "accept" && setup.payoutReadiness !== "ready")
    blockers.push("payout_account_required")

  return blockers
}

export async function getSetupPageState(input?: { returnTo?: string | null }) {
  const user = await requireActiveUser()
  const setup = await readSetup(user.id)

  return {
    variant: setup.createReady && setup.acceptReady ? "complete" : "incomplete",
    returnTo: input?.returnTo ?? null,
    setup,
  }
}

export async function getSetupChecklist(userId: string) {
  const current = await requireActiveUser()
  if (current.id !== userId) return null
  return readSetup(userId)
}

export async function getSetupProgress(userId: string) {
  const setup = await getSetupChecklist(userId)
  if (!setup) return null

  const checks = [
    setup.userStatus === "active",
    setup.identityStatus === "verified",
    setup.adultStatus === "verified",
    setup.paymentReadiness === "ready",
    setup.payoutReadiness === "ready",
    setup.termsAccepted,
  ]

  return {
    setup,
    completed: checks.filter(Boolean).length,
    total: checks.length,
    percent: Math.round((checks.filter(Boolean).length / checks.length) * 100),
  }
}

export async function getSetupBlockersForAction(input: {
  userId: string
  action: "create" | "accept" | "confirm"
}) {
  const setup = await getSetupChecklist(input.userId)
  if (!setup) return { blocked: true, blockers: ["unauthorized"] }

  const blockers = blockersFor(input.action, setup)
  return { blocked: blockers.length > 0, blockers, setup }
}

export async function getCreateVouchSetupGate(userId: string) {
  const setup = await getSetupChecklist(userId)
  if (!setup) return { allowed: false, blockers: ["unauthorized"] }

  const blockers = blockersFor("create", setup)
  return { allowed: blockers.length === 0, blockers, setup }
}

export async function getAcceptVouchSetupGate(input: { userId: string }) {
  const setup = await getSetupChecklist(input.userId)
  if (!setup) return { allowed: false, blockers: ["unauthorized"] }

  const blockers = blockersFor("accept", setup)
  return { allowed: blockers.length === 0, blockers, setup }
}

export async function getConfirmPresenceSetupGate(input: { userId: string }) {
  const setup = await getSetupChecklist(input.userId)
  if (!setup) return { allowed: false, blockers: ["unauthorized"] }

  const blockers = blockersFor("confirm", setup)
  return { allowed: blockers.length === 0, blockers, setup }
}

export async function getTermsAcceptanceStatus(userId: string) {
  const setup = await getSetupChecklist(userId)
  return setup
    ? {
        userId,
        accepted: setup.termsAccepted,
        termsVersion: setup.termsVersion,
        acceptedAt: setup.termsAcceptedAt,
      }
    : null
}

export async function getSetupReturnContext(input?: {
  returnTo?: string | null
  inviteToken?: string | null
}) {
  return {
    returnTo: input?.returnTo ?? "/dashboard",
    inviteToken: input?.inviteToken ?? null,
  }
}

export async function getAccountReadinessSummary(userId: string) {
  return getSetupChecklist(userId)
}
