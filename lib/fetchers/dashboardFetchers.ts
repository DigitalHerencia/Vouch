import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma, VouchStatus } from "@/prisma/generated/prisma/client"

import {
  getDashboardVariant,
  mapDashboardSummaryDTO,
  type DashboardFiltersDTO,
  type DashboardPageStateDTO,
  type DashboardSummaryDTO,
} from "@/lib/dto/dashboard.mappers"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import { vouchCardSelect } from "@/lib/db/selects/vouch.selects"

const DEFAULT_TAKE = 10

type VouchCardRecord = Prisma.VouchGetPayload<{ select: typeof vouchCardSelect }>

async function parseDashboardSearchParams(
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

async function getDashboardSummary(userId: string): Promise<DashboardSummaryDTO | null> {
  const current = await requireActiveUser()
  if (current.id !== userId) return null

  const now = new Date()

  const [drafts, actionRequired, active, completed, expired, archived] = await Promise.all([
    getDraftVouches({ userId }),
    getActionRequiredVouches({ userId }),
    getActiveVouches({ userId }),
    getCompletedVouches({ userId }),
    getExpiredVouches({ userId }),
    listForUser(userId, { archived: true }),
  ])

  return mapDashboardSummaryDTO({
    userId,
    drafts,
    actionRequired,
    active,
    completed,
    expired: expired.filter((vouch) => vouch.confirmationExpiresAt <= now),
    archived,
  })
}

async function getDraftVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archived: false,
    status: "draft" satisfies VouchStatus,
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

async function getActionRequiredVouches(input: {
  userId: string
}): Promise<VouchCardRecord[]> {
  const now = new Date()

  return listForUser(input.userId, {
    archived: false,
    status: "can_capture" satisfies VouchStatus,
    confirmationOpensAt: { lte: now },
    confirmationExpiresAt: { gt: now },
  })
}

async function getActiveVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archived: false,
    status: {
      in: ["active", "authorized", "can_capture"] satisfies VouchStatus[],
    },
  })
}

async function getCompletedVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archived: false,
    status: "captured" satisfies VouchStatus,
  })
}

async function getExpiredVouches(input: { userId: string }): Promise<VouchCardRecord[]> {
  return listForUser(input.userId, {
    archived: false,
    status: "expired" satisfies VouchStatus,
  })
}
