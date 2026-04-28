import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getCreateVouchSetupGate } from "@/lib/fetchers/setupFetchers"
import { prisma } from "@/lib/db/prisma"
import { vouchCardSelect } from "@/lib/db/selects/vouch.selects"

const iso = (v: Date | null | undefined) => (v ? v.toISOString() : null)

function mapVouch(v: any) {
  return v
    ? {
        ...v,
        meetingStartsAt: iso(v.meetingStartsAt),
        confirmationOpensAt: iso(v.confirmationOpensAt),
        confirmationExpiresAt: iso(v.confirmationExpiresAt),
        acceptedAt: iso(v.acceptedAt),
        completedAt: iso(v.completedAt),
        expiredAt: iso(v.expiredAt),
        canceledAt: iso(v.canceledAt),
        failedAt: iso(v.failedAt),
        createdAt: iso(v.createdAt),
        updatedAt: iso(v.updatedAt),
      }
    : null
}

export async function parseDashboardSearchParams(
  searchParams: Record<string, string | string[] | undefined>
) {
  const value = (key: string) => {
    const raw = searchParams[key]
    return Array.isArray(raw) ? raw[0] : raw
  }

  return {
    status: value("status") ?? "all",
    page: Math.max(Number(value("page") ?? 1), 1),
    sort: value("sort") ?? "newest",
  }
}

async function listForUser(userId: string, where: any, take = 10) {
  noStore()
  const rows = await prisma.vouch.findMany({
    where: {
      AND: [{ OR: [{ payerId: userId }, { payeeId: userId }] }, where],
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: vouchCardSelect,
  })

  return rows.map(mapVouch)
}

export async function getDashboardSummary(userId: string) {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  const [actionRequired, active, pending, completed, expiredRefunded] = await Promise.all([
    getActionRequiredVouches({ userId }),
    getActiveVouches({ userId }),
    getPendingVouches({ userId }),
    getCompletedVouches({ userId }),
    getExpiredRefundedVouches({ userId }),
  ])

  return {
    userId,
    counts: {
      actionRequired: actionRequired.length,
      active: active.length,
      pending: pending.length,
      completed: completed.length,
      expiredRefunded: expiredRefunded.length,
    },
    sections: { actionRequired, active, pending, completed, expiredRefunded },
  }
}

export async function getDashboardPageState(input?: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const current = await requireActiveUser()
  const filters = await parseDashboardSearchParams(input?.searchParams ?? {})
  const summary = await getDashboardSummary(current.id)

  return {
    variant:
      summary && Object.values(summary.counts).some(Boolean) ? "mixed_vouch_states" : "empty",
    filters,
    summary,
  }
}

export async function getDashboardSetupBanner(userId: string) {
  const gate = await getCreateVouchSetupGate(userId)
  return gate.allowed
    ? { visible: false, gate }
    : { visible: true, title: "Finish setup to create a Vouch", gate }
}

export async function getActionRequiredVouches(input: { userId: string }) {
  const now = new Date()
  return listForUser(input.userId, {
    status: "active",
    confirmationOpensAt: { lte: now },
    confirmationExpiresAt: { gt: now },
  })
}

export async function getActiveVouches(input: { userId: string }) {
  return listForUser(input.userId, { status: "active" })
}

export async function getPendingVouches(input: { userId: string }) {
  return listForUser(input.userId, { status: "pending" })
}

export async function getCompletedVouches(input: { userId: string }) {
  return listForUser(input.userId, { status: "completed" })
}

export async function getExpiredRefundedVouches(input: { userId: string }) {
  return listForUser(input.userId, { status: { in: ["expired", "refunded"] } })
}

export async function getPayerDashboardSummary(userId: string) {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  const rows = await prisma.vouch.findMany({
    where: { payerId: userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: vouchCardSelect,
  })

  return rows.map(mapVouch)
}

export async function getPayeeDashboardSummary(userId: string) {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  const rows = await prisma.vouch.findMany({
    where: { payeeId: userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: vouchCardSelect,
  })

  return rows.map(mapVouch)
}

export async function getDashboardEmptyState(userId: string) {
  return {
    userId,
    title: "No Vouches yet",
    message: "Create one to back an appointment with a clear payment commitment.",
    cta: { label: "Create a Vouch", href: "/vouches/new" },
  }
}

export async function getDashboardErrorState(input: { message?: string }) {
  return {
    variant: "error",
    message: input.message ?? "Dashboard could not be loaded.",
  }
}
