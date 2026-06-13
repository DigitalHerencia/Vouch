// lib/fetchers/dashboardFetchers.ts

import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import type { Prisma, VouchStatus } from "@/prisma/generated/prisma/client"

import { getDashboardVariant, mapDashboardSummaryDTO } from "@/lib/db/dto/dashboard.mappers"
import { prisma } from "@/lib/db/prisma"
import { vouchCardSelect } from "@/lib/db/selects/vouch.selects"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { syncConnectedAccountReadinessForUser } from "@/lib/integrations/stripe/connected-account-sync"
import { parseDashboardSearchParams } from "@/schemas/dashboardSchemas"
import type {
  DashboardPageStateDTO,
  DashboardSectionKey,
  DashboardSummaryDTO,
} from "@/types/dashboardTypes"

const DEFAULT_TAKE = 10

const ACTIVE_DB_STATUSES: VouchStatus[] = ["protocol_fee_paid", "authorized"]

type VouchCardRecord = Prisma.VouchGetPayload<{ select: typeof vouchCardSelect }>

function hasSearchParam(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value)
}

async function syncStripeReturns(input: {
  userId: string
  searchParams: Record<string, string | string[] | undefined>
}): Promise<void> {
  const stripeConnectReturn = hasSearchParam(input.searchParams.stripe_connect_return)
  if (!stripeConnectReturn) return

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

function getParticipantWhere(userId: string): Prisma.VouchWhereInput {
  return {
    OR: [{ merchantId: userId }, { customerId: userId }],
  }
}

function getDashboardSectionWhere(
  now = new Date()
): Record<DashboardSectionKey, Prisma.VouchWhereInput> {
  return {
    drafts: {
      archived: false,
      status: "draft",
    },
    actionRequired: {
      archived: false,
      status: "authorized",
      confirmationOpensAt: { lte: now },
      confirmationExpiresAt: { gt: now },
    },
    active: {
      archived: false,
      status: { in: ACTIVE_DB_STATUSES },
      OR: [
        { status: "protocol_fee_paid" },
        { confirmationOpensAt: { gt: now } },
        { confirmationExpiresAt: { lte: now } },
      ],
    },
    completed: {
      archived: false,
      status: "captured",
    },
    expired: {
      archived: false,
      status: "expired",
      confirmationExpiresAt: { lte: now },
    },
    archived: {
      archived: true,
    },
  }
}

function listVouchesForUser(input: {
  participantWhere: Prisma.VouchWhereInput
  sectionWhere: Prisma.VouchWhereInput
  bounded?: boolean
}): Promise<VouchCardRecord[]> {
  return prisma.vouch.findMany({
    where: {
      AND: [input.participantWhere, input.sectionWhere],
    },
    orderBy: { updatedAt: "desc" },
    ...(input.bounded === false ? {} : { take: DEFAULT_TAKE }),
    select: vouchCardSelect,
  })
}

function countVouchesForUser(input: {
  participantWhere: Prisma.VouchWhereInput
  sectionWhere: Prisma.VouchWhereInput
}): Promise<number> {
  return prisma.vouch.count({
    where: {
      AND: [input.participantWhere, input.sectionWhere],
    },
  })
}

async function getDashboardSummary(userId: string): Promise<DashboardSummaryDTO> {
  const participantWhere = getParticipantWhere(userId)
  const sectionWhere = getDashboardSectionWhere()

  const [
    drafts,
    actionRequired,
    active,
    completed,
    expired,
    draftCount,
    actionRequiredCount,
    activeCount,
    completedCount,
    expiredCount,
  ] = await Promise.all([
    listVouchesForUser({ participantWhere, sectionWhere: sectionWhere.drafts }),
    listVouchesForUser({ participantWhere, sectionWhere: sectionWhere.actionRequired }),
    listVouchesForUser({ participantWhere, sectionWhere: sectionWhere.active }),
    listVouchesForUser({ participantWhere, sectionWhere: sectionWhere.completed }),
    listVouchesForUser({ participantWhere, sectionWhere: sectionWhere.expired }),
    countVouchesForUser({ participantWhere, sectionWhere: sectionWhere.drafts }),
    countVouchesForUser({ participantWhere, sectionWhere: sectionWhere.actionRequired }),
    countVouchesForUser({ participantWhere, sectionWhere: sectionWhere.active }),
    countVouchesForUser({ participantWhere, sectionWhere: sectionWhere.completed }),
    countVouchesForUser({ participantWhere, sectionWhere: sectionWhere.expired }),
  ])

  return mapDashboardSummaryDTO({
    userId,
    counts: {
      drafts: draftCount,
      actionRequired: actionRequiredCount,
      active: activeCount,
      completed: completedCount,
      expired: expiredCount,
      archived: 0,
    },
    drafts,
    actionRequired,
    active,
    completed,
    expired,
    archived: [],
  })
}

export async function getArchivePageState(): Promise<{
  count: number
  vouches: VouchCardRecord[]
}> {
  noStore()

  const current = await requireActiveUser()
  const participantWhere = getParticipantWhere(current.id)
  const archivedWhere = getDashboardSectionWhere().archived
  const [vouches, count] = await Promise.all([
    listVouchesForUser({ participantWhere, sectionWhere: archivedWhere, bounded: false }),
    countVouchesForUser({ participantWhere, sectionWhere: archivedWhere }),
  ])

  return { count, vouches }
}

export async function getDashboardPageState(input?: {
  searchParams?: Record<string, string | string[] | undefined>
}): Promise<DashboardPageStateDTO> {
  noStore()

  const searchParams = input?.searchParams ?? {}
  const filters = parseDashboardSearchParams(searchParams)
  const current = await requireActiveUser()

  await syncStripeReturns({
    userId: current.id,
    searchParams,
  })

  const summary = await getDashboardSummary(current.id)

  return {
    variant: getDashboardVariant(summary),
    filters,
    summary,
  }
}
