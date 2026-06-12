import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { canCreateVouch } from "@/lib/authz/policies"
import { prisma } from "@/lib/db/prisma"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

const readinessSelect = {
  id: true,
  status: true,
  connectedAccount: {
    select: {
      stripeAccountId: true,
      chargesEnabled: true,
      detailsSubmitted: true,
      payoutsEnabled: true,
    },
  },
} satisfies Prisma.UserSelect

type ReadinessRecord = Prisma.UserGetPayload<{ select: typeof readinessSelect }>

function normalizeReadiness(record: ReadinessRecord | null) {
  const connectedAccount = record?.connectedAccount ?? null
  const merchantAccountReady = Boolean(
    connectedAccount?.stripeAccountId &&
    connectedAccount.chargesEnabled &&
    connectedAccount.detailsSubmitted &&
    connectedAccount.payoutsEnabled
  )

  const state = {
    userId: record?.id ?? null,
    userStatus: record?.status === "active" ? ("active" as const) : ("disabled" as const),
    payoutReadiness: merchantAccountReady ? "ready" : "not_started",
    hasConnectedAccount: Boolean(connectedAccount?.stripeAccountId),
  }

  return {
    ...state,
    createReady: canCreateVouch(state),
    acceptReady: state.userStatus === "active",
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
  if (kind === "create" && readiness.payoutReadiness !== "ready") {
    blockers.push("connected_account_required")
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
