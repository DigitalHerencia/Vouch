import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  adminAuditEventDetailSelect,
  adminAuditLogSelect,
  adminDashboardSummarySelect,
  adminFailureHeavySummarySelect,
  adminPaymentDetailSelect,
  adminPaymentListSelect,
  adminUserDetailSelect,
  adminUserListSelect,
  adminVouchDetailSelect,
  adminVouchListSelect,
  adminVouchPaymentFailureSelect,
  adminWebhookEventDetailSelect,
  adminWebhookEventListSelect,
} from "@/lib/db/selects/admin.selects"

const DEFAULT_PAGE_SIZE = 25

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

function mapDates<T>(value: T): T {
  if (!value || typeof value !== "object") return value
  if (value instanceof Date) return iso(value) as T
  if (Array.isArray(value)) return value.map(mapDates) as T

  const out: Record<string, unknown> = {}

  for (const [key, child] of Object.entries(value)) {
    out[key] = mapDates(child)
  }

  return out as T
}

async function requireAdmin() {
  const user = await requireActiveUser()

  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  if (!isAdmin) {
    throw new Error("ADMIN_UNAUTHORIZED")
  }

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

export async function getAdminDashboardState(input?: { page?: number; pageSize?: number }) {
  noStore()
  await requireAdmin()

  const [summary, failureHeavy] = await Promise.all([
    getAdminDashboardSummary(input),
    getAdminFailureHeavyState(input),
  ])

  return {
    variant: failureHeavy.items.length > 0 ? "failure_heavy" : "dashboard",
    summary,
    failureHeavy,
  }
}

export async function getAdminDashboardSummary(input?: { page?: number; pageSize?: number }) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const [vouchCounts, paymentFailureCount, refundFailureCount, recent] = await Promise.all([
    prisma.vouch.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.paymentRecord.count({ where: { status: "failed" } }),
    prisma.refundRecord.count({ where: { status: "failed" } }),
    prisma.vouch.findMany({
      orderBy: { updatedAt: "desc" },
      take: page.take,
      skip: page.skip,
      select: adminDashboardSummarySelect,
    }),
  ])

  return {
    counts: {
      vouchesByStatus: Object.fromEntries(vouchCounts.map((row) => [row.status, row._count._all])),
      paymentFailures: paymentFailureCount,
      refundFailures: refundFailureCount,
    },
    recent: recent.map(mapDates),
    page: page.page,
    pageSize: page.pageSize,
  }
}

export async function getAdminFailureHeavyState(input?: { page?: number; pageSize?: number }) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.vouch.findMany({
    where: {
      OR: [
        { status: "failed" },
        { paymentRecord: { status: "failed" } },
        { refundRecord: { status: "failed" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminFailureHeavySummarySelect,
  })

  return {
    variant: rows.length > 0 ? "failure_heavy" : "no_failures",
    items: rows.map(mapDates),
    page: page.page,
    pageSize: page.pageSize,
  }
}

export async function listAdminVouches(input?: {
  status?: string
  paymentStatus?: string
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.vouch.findMany({
    where: {
      ...(input?.status ? { status: input.status as any } : {}),
      ...(input?.paymentStatus ? { paymentRecord: { status: input.paymentStatus as any } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminVouchListSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminVouchDetail(input: { vouchId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.vouch.findUnique({
      where: { id: input.vouchId },
      select: adminVouchDetailSelect,
    })
  )
}

export async function getAdminVouchCompletedState(input: { vouchId: string }) {
  const vouch = await getAdminVouchDetail(input)
  return { variant: "completed", vouch }
}

export async function getAdminVouchExpiredRefundedState(input: { vouchId: string }) {
  const vouch = await getAdminVouchDetail(input)
  return { variant: "expired_refunded", vouch }
}

export async function getAdminVouchPaymentFailedState(input: { vouchId: string }) {
  noStore()
  await requireAdmin()

  const vouch = await prisma.vouch.findUnique({
    where: { id: input.vouchId },
    select: adminVouchPaymentFailureSelect,
  })

  return {
    variant: "payment_failed",
    vouch: mapDates(vouch),
  }
}

export async function listAdminUsers(input?: {
  status?: string
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.user.findMany({
    where: {
      ...(input?.status ? { status: input.status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminUserListSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminUserDetail(input: { userId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.user.findUnique({
      where: { id: input.userId },
      select: adminUserDetailSelect,
    })
  )
}

export async function listAdminPayments(input?: {
  paymentStatus?: string
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.paymentRecord.findMany({
    where: {
      ...(input?.paymentStatus ? { status: input.paymentStatus as any } : {}),
    },
    orderBy: { updatedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminPaymentListSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminPaymentDetail(input: { paymentId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.paymentRecord.findUnique({
      where: { id: input.paymentId },
      select: adminPaymentDetailSelect,
    })
  )
}

export async function listAdminWebhookEvents(input?: {
  processed?: boolean
  eventType?: string
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.paymentWebhookEvent.findMany({
    where: {
      ...(typeof input?.processed === "boolean" ? { processed: input.processed } : {}),
      ...(input?.eventType ? { eventType: input.eventType } : {}),
    },
    orderBy: { receivedAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminWebhookEventListSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminWebhookEventDetail(input: { eventId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.paymentWebhookEvent.findUnique({
      where: { id: input.eventId },
      select: adminWebhookEventDetailSelect,
    })
  )
}

export async function listAdminAuditEvents(input?: {
  entityType?: string
  entityId?: string
  eventName?: string
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
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminAuditLogSelect,
  })

  return rows.map(mapDates)
}

export async function getAdminAuditEventDetail(input: { auditEventId: string }) {
  noStore()
  await requireAdmin()

  return mapDates(
    await prisma.auditEvent.findUnique({
      where: { id: input.auditEventId },
      select: adminAuditEventDetailSelect,
    })
  )
}

export async function getAdminSafeRetryPreview(input: {
  operation:
    | "retry_notification_send"
    | "retry_provider_reconciliation"
    | "retry_webhook_processing"
    | "retry_refund_status_sync"
  entityId: string
}) {
  noStore()
  await requireAdmin()

  return {
    variant: "safe_retry_confirmation",
    operation: input.operation,
    entityId: input.entityId,
    allowed: true,
    warning:
      "This records an operational retry request only. It does not manually award funds, rewrite confirmations, or decide disputes.",
  }
}

export async function getAdminUnauthorizedState(input?: { reason?: string }) {
  return {
    variant: "unauthorized",
    reason: input?.reason ?? "Admin access is required.",
  }
}
