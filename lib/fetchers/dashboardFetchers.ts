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
import {
  syncConnectedAccountReadinessForUser,
  syncPaymentCustomerReadinessForUser,
} from "@/lib/payments/stripeReadinessSync"
import { getAccountReadiness } from "@/lib/fetchers/readinessFetchers"

const DEFAULT_TAKE = 10
const READINESS_REFRESH_INTERVAL_MS = 5 * 60 * 1000
const ACTIVE_DB_STATUSES: VouchStatus[] = ["protocol_fee_paid", "authorized"]

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

async function syncStripeReturns(input: {
  userId: string
  paymentMethodReady: boolean
  searchParams: Record<string, string | string[] | undefined>
}): Promise<void> {
  const stripeConnectReturn = input.searchParams.stripe_connect_return
  const stripePaymentReturn = input.searchParams.stripe_payment_return

  if (stripeConnectReturn) {
    const connectedAccount = await prisma.connectedAccount.findUnique({
      where: { userId: input.userId },
      select: { stripeAccountId: true },
    })

    if (connectedAccount?.stripeAccountId) {
      await syncConnectedAccountReadinessForUser({
        userId: input.userId,
        stripeAccountId: connectedAccount.stripeAccountId,
      })
    }
  }

  if (stripePaymentReturn || !input.paymentMethodReady) {
    const paymentCustomer = await prisma.paymentCustomer.findUnique({
      where: { userId: input.userId },
      select: { stripeCustomerId: true, syncedAt: true },
    })

    const stale =
      !paymentCustomer?.syncedAt ||
      Date.now() - paymentCustomer.syncedAt.getTime() >= READINESS_REFRESH_INTERVAL_MS
    if (paymentCustomer?.stripeCustomerId && (stripePaymentReturn || stale)) {
      await syncPaymentCustomerReadinessForUser({
        userId: input.userId,
        stripeCustomerId: paymentCustomer.stripeCustomerId,
      })
    }
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
  const now = new Date()
  const participantWhere = { OR: [{ merchantId: userId }, { customerId: userId }] }
  const sectionWhere = {
    drafts: { archived: false, status: "draft" },
    actionRequired: {
      archived: false,
      status: "can_capture",
      confirmationOpensAt: { lte: now },
      confirmationExpiresAt: { gt: now },
    },
    active: { archived: false, status: { in: ACTIVE_DB_STATUSES } },
    completed: { archived: false, status: "captured" },
    expired: { archived: false, status: "expired", confirmationExpiresAt: { lte: now } },
    archived: { archived: true },
  } satisfies Record<keyof DashboardSummaryDTO["sections"], Prisma.VouchWhereInput>

  const [sections, countValues] = await Promise.all([
    Promise.all([
      listForUser(userId, sectionWhere.drafts),
      listForUser(userId, sectionWhere.actionRequired),
      listForUser(userId, sectionWhere.active),
      listForUser(userId, sectionWhere.completed),
      listForUser(userId, sectionWhere.expired),
      listForUser(userId, sectionWhere.archived),
    ]),
    Promise.all([
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.drafts] } }),
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.actionRequired] } }),
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.active] } }),
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.completed] } }),
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.expired] } }),
      prisma.vouch.count({ where: { AND: [participantWhere, sectionWhere.archived] } }),
    ]),
  ])
  const [drafts, actionRequired, active, completed, expired, archived] = sections
  const [
    draftCount,
    actionRequiredCount,
    activeCount,
    completedCount,
    expiredCount,
    archivedCount,
  ] = countValues

  return mapDashboardSummaryDTO({
    userId,
    counts: {
      drafts: draftCount,
      actionRequired: actionRequiredCount,
      active: activeCount,
      completed: completedCount,
      expired: expiredCount,
      archived: archivedCount,
    },
    drafts,
    actionRequired,
    active,
    completed,
    expired,
    archived,
  })
}

export async function getDashboardPageState(input?: {
  searchParams?: Record<string, string | string[] | undefined>
}): Promise<DashboardPageStateDTO> {
  const current = await requireActiveUser()
  await syncStripeReturns({
    userId: current.id,
    paymentMethodReady: current.readiness.paymentMethodReady === "ready",
    searchParams: input?.searchParams ?? {},
  })
  const readiness = await getAccountReadiness(current.id)
  const filters = await parseDashboardSearchParams(input?.searchParams ?? {})
  const summary = await getDashboardSummary(current.id)

  return {
    variant: getDashboardVariant(summary),
    filters,
    summary,
    warnings: {
      paymentMethodRequired: readiness?.paymentMethodReady !== "ready",
    },
  }
}
