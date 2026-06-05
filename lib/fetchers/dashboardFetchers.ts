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

const DEFAULT_TAKE = 10
const ACTIVE_DB_STATUSES = [
  "protocol_fee_paid",
  "authorized",
] as const satisfies readonly VouchStatus[]

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

  if (stripePaymentReturn) {
    const paymentCustomer = await prisma.paymentCustomer.findUnique({
      where: { userId: input.userId },
      select: { stripeCustomerId: true },
    })

    if (paymentCustomer?.stripeCustomerId) {
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
  const vouches = await listForUser(userId, {}, DEFAULT_TAKE * 6)
  const current = vouches.filter((vouch) => !vouch.archived)
  const drafts = current.filter((vouch) => vouch.status === "draft").slice(0, DEFAULT_TAKE)
  const actionRequired = current
    .filter(
      (vouch) =>
        vouch.status === "can_capture" &&
        vouch.confirmationOpensAt <= now &&
        vouch.confirmationExpiresAt > now
    )
    .slice(0, DEFAULT_TAKE)
  const active = current
    .filter((vouch) => ACTIVE_DB_STATUSES.includes(vouch.status as (typeof ACTIVE_DB_STATUSES)[number]))
    .slice(0, DEFAULT_TAKE)
  const completed = current
    .filter((vouch) => vouch.status === "captured")
    .slice(0, DEFAULT_TAKE)
  const expired = current.filter((vouch) => vouch.status === "expired").slice(0, DEFAULT_TAKE)
  const archived = vouches.filter((vouch) => vouch.archived).slice(0, DEFAULT_TAKE)

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

export async function getDashboardPageState(input?: {
  searchParams?: Record<string, string | string[] | undefined>
}): Promise<DashboardPageStateDTO> {
  const current = await requireActiveUser()
  await syncStripeReturns({ userId: current.id, searchParams: input?.searchParams ?? {} })
  const filters = await parseDashboardSearchParams(input?.searchParams ?? {})
  const summary = await getDashboardSummary(current.id)

  return {
    variant: getDashboardVariant(summary),
    filters,
    summary,
    warnings: {
      paymentMethodRequired: current.readiness.paymentMethodReady !== "ready",
    },
  }
}
