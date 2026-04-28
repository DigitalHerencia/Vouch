import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  adminAuditEventDetailSelect,
  adminAuditListItemSelect,
  participantSafeAuditTimelineItemSelect,
  paymentAuditSummarySelect,
  userAuditSummarySelect,
  vouchAuditSummarySelect,
} from "@/lib/db/selects/audit.selects"

const DEFAULT_PAGE_SIZE = 25

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

function mapDates<T>(value: T): T {
  if (!value || typeof value !== "object") return value
  if (value instanceof Date) return iso(value) as T
  if (Array.isArray(value)) return value.map(mapDates) as T

  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) out[key] = mapDates(child)

  return out as T
}

async function requireAdmin() {
  const user = await requireActiveUser()

  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  if (!isAdmin) throw new Error("ADMIN_UNAUTHORIZED")

  return user
}

function pageArgs(input?: { page?: number; pageSize?: number }) {
  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

async function assertParticipantVouch(vouchId: string) {
  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ payerId: user.id }, { payeeId: user.id }],
    },
    select: { id: true },
  })

  return Boolean(vouch)
}

export async function getParticipantSafeAuditTimeline(input: {
  vouchId: string
  page?: number
  pageSize?: number
}) {
  noStore()

  const allowed = await assertParticipantVouch(input.vouchId)
  if (!allowed) return []

  const page = pageArgs(input)

  const rows = await prisma.auditEvent.findMany({
    where: {
      entityType: "Vouch",
      entityId: input.vouchId,
      participantSafe: true,
    },
    orderBy: { createdAt: "asc" },
    skip: page.skip,
    take: page.take,
    select: participantSafeAuditTimelineItemSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminAuditTimeline(input?: {
  entityType?: string
  entityId?: string
  eventName?: string
  actorUserId?: string
  page?: number
  pageSize?: number
}) {
  return listAuditEvents(input)
}

export async function listAuditEvents(input?: {
  entityType?: string
  entityId?: string
  eventName?: string
  actorUserId?: string
  participantSafe?: boolean
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.auditEvent.findMany({
    where: {
      ...(input?.entityType ? { entityType: input.entityType } : {}),
      ...(input?.entityId ? { entityId: input.entityId } : {}),
      ...(input?.eventName ? { eventName: input.eventName } : {}),
      ...(input?.actorUserId ? { actorUserId: input.actorUserId } : {}),
      ...(typeof input?.participantSafe === "boolean"
        ? { participantSafe: input.participantSafe }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminAuditListItemSelect,
  })

  return rows.map(mapDates)
}

export async function getAuditEventDetail(input: { auditEventId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.auditEvent.findUnique({
      where: { id: input.auditEventId },
      select: adminAuditEventDetailSelect,
    })
  )
}

export async function getVouchAuditSummary(vouchId: string) {
  noStore()

  const allowed = await assertParticipantVouch(vouchId)
  if (!allowed) return []

  const rows = await prisma.auditEvent.findMany({
    where: {
      entityType: "Vouch",
      entityId: vouchId,
      participantSafe: true,
    },
    orderBy: { createdAt: "asc" },
    select: vouchAuditSummarySelect,
  })

  return rows.map(mapDates)
}

export async function getPaymentAuditSummary(paymentId: string) {
  noStore()

  const user = await requireActiveUser()

  const payment = await prisma.paymentRecord.findFirst({
    where: {
      id: paymentId,
      vouch: {
        OR: [{ payerId: user.id }, { payeeId: user.id }],
      },
    },
    select: { id: true },
  })

  if (!payment) return []

  const rows = await prisma.auditEvent.findMany({
    where: {
      entityType: "PaymentRecord",
      entityId: paymentId,
      participantSafe: true,
    },
    orderBy: { createdAt: "asc" },
    select: paymentAuditSummarySelect,
  })

  return rows.map(mapDates)
}

export async function getUserAuditSummary(userId: string) {
  noStore()

  const user = await requireActiveUser()
  const isSelf = user.id === userId
  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  if (!isSelf && !isAdmin) return []

  const rows = await prisma.auditEvent.findMany({
    where: {
      actorUserId: userId,
      ...(isAdmin ? {} : { participantSafe: true }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: isAdmin ? adminAuditListItemSelect : userAuditSummarySelect,
  })

  return rows.map(mapDates)
}
