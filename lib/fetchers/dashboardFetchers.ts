import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma, VouchStatus } from "@/prisma/generated/prisma/client"

import {
  getDashboardVariant,
  mapDashboardReadinessCalloutDTO,
  mapDashboardSummaryDTO,
  type DashboardEmptyStateDTO,
  type DashboardFiltersDTO,
  type DashboardPageStateDTO,
  type DashboardReadinessCalloutDTO,
  type DashboardSummaryDTO,
} from "@/lib/dto/dashboard.mappers"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getCreateVouchSetupGate } from "@/lib/fetchers/setupFetchers"
import { prisma } from "@/lib/db/prisma"
import { vouchCardSelect } from "@/lib/db/selects/vouch.selects"

const DEFAULT_TAKE = 10

type VouchCardRecord = Prisma.VouchGetPayload<{ select: typeof vouchCardSelect }>

export async function parseDashboardSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): Promise<DashboardFiltersDTO> {
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

async function listForUser(
  userId: string,
  where: Prisma.VouchWhereInput,
  take = DEFAULT_TAKE
): Promise<VouchCardRecord[]> {
  noStore()

  return prisma.vouch.findMany({
    where: {
      AND: [
        {
          OR: [{ merchantId: userId }, { customerId: userId }],
        },
        where,
      ],
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: vouchCardSelect,
  })
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummaryDTO | null> {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  const now = new Date()

  const [actionRequired, active, completed, expired, archived] = await Promise.all([
    getActionRequiredVouches({ userId }),
    getActiveVouches({ userId }),
    getCompletedVouches({ userId }),
    getExpiredVouches({ userId }),
    listForUser(userId, { archiveStatus: "archived" }),
  ])

  return mapDashboardSummaryDTO({
    userId,
    actionRequired,
    active,
    completed,
    expired: expired.filter((vouch) => vouch.confirmationExpiresAt <= now),
    archived,
  })
}

export async function getDashboardPageState(input?: {
  searchParams?: Record<string, string | string[] | undefined>
}): Promise<DashboardPageStateDTO> {
  const current = await requireActiveUser()
  const filters = await parseDashboardSearchParams(input?.searchParams ?? {})
  const summary = await getDashboardSummary(current.id)

  return {
    variant: getDashboardVariant(summary),
    filters,
    summary,
  }
}

export async function getDashboardSetupBanner(
  userId: string
): Promise<DashboardReadinessCalloutDTO> {
  const gate = await getCreateVouchSetupGate(userId)

  const blockers = Array.isArray(gate.blockers) ? gate.blockers.map(String) : []

  return mapDashboardReadinessCalloutDTO({
    canCreateVouch: gate.allowed,
    needsPayment: blockers.some((blocker) => blocker.includes("payment")),
    needsPayout: blockers.some(
      (blocker) => blocker.includes("payout") || blocker.includes("connect")
    ),
    needsTerms: blockers.some((blocker) => blocker.includes("terms")),
    needsVerification: blockers.some(
      (blocker) => blocker.includes("identity") || blocker.includes("adult")
    ),
  })
}

export async function getActionRequiredVouches(input: {
  userId: string
}): Promise<VouchCardRecord[]> {
  const now = new Date()

  return listForUser(input.userId, {
    archiveStatus: "active",
    status: "confirmable" satisfies VouchStatus,
    confirmationOpensAt: { lte: now },
    confirmationExpiresAt: { gt: now },
  })
}

export async function getActiveVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archiveStatus: "active",
    status: {
      in: ["committed", "sent", "accepted", "authorized", "confirmable"] satisfies VouchStatus[],
    },
  })
}

export async function getCompletedVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archiveStatus: "active",
    status: "completed" satisfies VouchStatus,
  })
}

export async function getExpiredVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archiveStatus: "active",
    status: "expired" satisfies VouchStatus,
  })
}

export async function getMerchantDashboardSummary(
  userId: string
): Promise<VouchCardRecord[] | null> {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  noStore()

  return prisma.vouch.findMany({
    where: { merchantId: userId },
    orderBy: { updatedAt: "desc" },
    take: DEFAULT_TAKE,
    select: vouchCardSelect,
  })
}

export async function getCustomerDashboardSummary(
  userId: string
): Promise<VouchCardRecord[] | null> {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  noStore()

  return prisma.vouch.findMany({
    where: { customerId: userId },
    orderBy: { updatedAt: "desc" },
    take: DEFAULT_TAKE,
    select: vouchCardSelect,
  })
}

export async function getDashboardEmptyState(userId: string): Promise<DashboardEmptyStateDTO> {
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

/**
 * Compatibility aliases retained only for older imports during migration.
 */
export const getPendingVouches = getActiveVouches
export const getExpiredRefundedVouches = getExpiredVouches
export const getPayerDashboardSummary = getMerchantDashboardSummary
export const getPayeeDashboardSummary = getCustomerDashboardSummary
