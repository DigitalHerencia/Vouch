import "server-only"

import { prisma } from "@/lib/db/prisma"
import { getStripeServerClient } from "@/lib/integrations/stripe/client"
import { mapStripePaymentIntentStatus, mapStripeRefundStatus } from "@/lib/integrations/stripe/status-map"

export async function reconcileStuckPaymentRecords(input?: {
  limit?: number
}): Promise<{ reconciledCount: number; failedCount: number }> {
  const stripe = getStripeServerClient()
  const records = await prisma.paymentRecord.findMany({
    where: {
      provider: "stripe",
      providerPaymentId: { not: null },
      status: {
        in: ["requires_payment_method", "authorized", "release_pending", "refund_pending"],
      },
    },
    take: input?.limit ?? 50,
    orderBy: { updatedAt: "asc" },
    select: { id: true, providerPaymentId: true },
  })

  let reconciledCount = 0
  let failedCount = 0

  for (const record of records) {
    if (!record.providerPaymentId) continue
    try {
      const intent = await stripe.paymentIntents.retrieve(record.providerPaymentId)
      await prisma.paymentRecord.update({
        where: { id: record.id },
        data: {
          status: mapStripePaymentIntentStatus(intent.status),
          lastErrorCode: intent.last_payment_error?.code ?? null,
          lastErrorMessage: intent.last_payment_error?.message ?? null,
        },
      })
      reconciledCount += 1
    } catch {
      failedCount += 1
    }
  }

  return { reconciledCount, failedCount }
}

export async function runPaymentReconciliationJob(input?: {
  limit?: number
}): Promise<{ reconciledCount: number; failedCount: number }> {
  const payments = await reconcileStuckPaymentRecords(input)
  const refunds = await prisma.refundRecord.findMany({
    where: { providerRefundId: { not: null }, status: { in: ["pending", "failed"] } },
    take: input?.limit ?? 50,
    select: { id: true, paymentRecordId: true, providerRefundId: true },
  })
  const stripe = getStripeServerClient()
  let refundReconciled = 0
  let refundFailed = 0

  for (const refundRecord of refunds) {
    if (!refundRecord.providerRefundId) continue
    try {
      const refund = await stripe.refunds.retrieve(refundRecord.providerRefundId)
      const status = mapStripeRefundStatus(refund.status)
      await prisma.$transaction([
        prisma.refundRecord.update({ where: { id: refundRecord.id }, data: { status } }),
        prisma.paymentRecord.update({
          where: { id: refundRecord.paymentRecordId },
          data: { status: status === "succeeded" ? "refunded" : "refund_pending" },
        }),
      ])
      refundReconciled += 1
    } catch {
      refundFailed += 1
    }
  }

  return {
    reconciledCount: payments.reconciledCount + refundReconciled,
    failedCount: payments.failedCount + refundFailed,
  }
}
