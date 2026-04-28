import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"

type AnalyticsRangeInput = {
  from?: Date | string | null
  to?: Date | string | null
}

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

function getRange(input?: AnalyticsRangeInput) {
  return {
    gte: input?.from ? new Date(input.from) : undefined,
    lte: input?.to ? new Date(input.to) : undefined,
  }
}

async function requireAnalyticsAdmin() {
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

function countMap<T extends string>(rows: Array<{ eventName: T; _count: { _all: number } }>) {
  return Object.fromEntries(rows.map((row) => [row.eventName, row._count._all])) as Record<
    T,
    number
  >
}

async function countEvents(input: AnalyticsRangeInput | undefined, eventNames: string[]) {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["eventName"],
    where: {
      eventName: { in: eventNames },
      occurredAt: getRange(input),
    },
    _count: { _all: true },
  })

  return countMap(rows)
}

export async function getLifecycleAnalyticsSummary(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const [vouchesByStatus, paymentsByStatus, refundsByStatus, confirmations] = await Promise.all([
    prisma.vouch.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.paymentRecord.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.refundRecord.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.presenceConfirmation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ])

  return {
    range: {
      from: input?.from ? iso(new Date(input.from)) : null,
      to: input?.to ? iso(new Date(input.to)) : null,
    },
    vouchesByStatus: Object.fromEntries(
      vouchesByStatus.map((row) => [row.status, row._count._all])
    ),
    paymentsByStatus: Object.fromEntries(
      paymentsByStatus.map((row) => [row.status, row._count._all])
    ),
    refundsByStatus: Object.fromEntries(
      refundsByStatus.map((row) => [row.status, row._count._all])
    ),
    confirmationsByStatus: Object.fromEntries(
      confirmations.map((row) => [row.status, row._count._all])
    ),
  }
}

export async function getSetupFunnelSummary(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const events = await countEvents(input, [
    "setup.checklist_viewed",
    "setup.verification_started",
    "setup.verification_completed",
    "setup.verification_failed",
    "setup.payment_started",
    "setup.payment_ready",
    "setup.payout_started",
    "setup.payout_ready",
    "setup.terms_accepted",
  ])

  const readiness = await prisma.verificationProfile.groupBy({
    by: ["identityStatus", "adultStatus", "paymentReadiness", "payoutReadiness"],
    _count: { _all: true },
  })

  return {
    events,
    readinessBuckets: readiness.map((row) => ({
      identityStatus: row.identityStatus,
      adultStatus: row.adultStatus,
      paymentReadiness: row.paymentReadiness,
      payoutReadiness: row.payoutReadiness,
      count: row._count._all,
    })),
  }
}

export async function getVouchFunnelSummary(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const events = await countEvents(input, [
    "vouch.create_started",
    "vouch.create_submitted",
    "vouch.created",
    "vouch.invite_copied",
    "vouch.invite_sent",
    "vouch.invite_opened",
    "vouch.accept_started",
    "vouch.accepted",
    "vouch.declined",
    "vouch.confirmation_window_opened",
    "vouch.confirmation_submitted",
    "vouch.partially_confirmed",
    "vouch.completed",
    "vouch.expired",
    "vouch.refunded",
    "vouch.failed",
  ])

  const statuses = await prisma.vouch.groupBy({
    by: ["status"],
    _count: { _all: true },
  })

  return {
    events,
    vouchesByStatus: Object.fromEntries(statuses.map((row) => [row.status, row._count._all])),
  }
}

export async function getPaymentFailureAnalytics(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const [paymentFailures, failedPayments, failedRefunds] = await Promise.all([
    countEvents(input, ["payment.failed"]),
    prisma.paymentRecord.groupBy({
      by: ["lastErrorCode"],
      where: {
        status: "failed",
        updatedAt: getRange(input),
      },
      _count: { _all: true },
    }),
    prisma.refundRecord.groupBy({
      by: ["status", "reason"],
      where: {
        status: "failed",
        updatedAt: getRange(input),
      },
      _count: { _all: true },
    }),
  ])

  return {
    events: paymentFailures,
    failedPaymentsByCode: Object.fromEntries(
      failedPayments.map((row) => [row.lastErrorCode ?? "unknown", row._count._all])
    ),
    failedRefunds: failedRefunds.map((row) => ({
      status: row.status,
      reason: row.reason,
      count: row._count._all,
    })),
  }
}

export async function getNotificationDeliveryAnalytics(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const [events, delivery] = await Promise.all([
    countEvents(input, ["notification.queued", "notification.sent", "notification.failed"]),
    prisma.notificationEvent.groupBy({
      by: ["status", "channel", "eventName"],
      where: {
        createdAt: getRange(input),
      },
      _count: { _all: true },
    }),
  ])

  return {
    events,
    delivery: delivery.map((row) => ({
      status: row.status,
      channel: row.channel,
      eventName: row.eventName,
      count: row._count._all,
    })),
  }
}

export async function getAdminOperationalAnalytics(input?: AnalyticsRangeInput) {
  noStore()
  await requireAnalyticsAdmin()

  const [adminEvents, auditEvents, operationalRetries] = await Promise.all([
    countEvents(input, [
      "admin.dashboard_viewed",
      "admin.vouch_viewed",
      "admin.safe_retry_started",
      "admin.safe_retry_completed",
    ]),
    prisma.auditEvent.groupBy({
      by: ["eventName"],
      where: {
        actorType: "admin",
        createdAt: getRange(input),
      },
      _count: { _all: true },
    }),
    prisma.operationalRetry.groupBy({
      by: ["operation", "status"],
      where: {
        createdAt: getRange(input),
      },
      _count: { _all: true },
    }),
  ])

  return {
    events: adminEvents,
    auditEvents: Object.fromEntries(auditEvents.map((row) => [row.eventName, row._count._all])),
    operationalRetries: operationalRetries.map((row) => ({
      operation: row.operation,
      status: row.status,
      count: row._count._all,
    })),
  }
}
