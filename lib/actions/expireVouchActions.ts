import "server-only"

import { prisma } from "@/lib/db/prisma"
import { refundOrVoidStripePaymentForVouch } from "@/lib/actions/stripePaymentActions"

export async function findExpiredUnresolvedVouches(input?: { now?: Date; limit?: number }) {
  return prisma.vouch.findMany({
    where: {
      status: { in: ["pending", "active"] },
      confirmationExpiresAt: { lte: input?.now ?? new Date() },
    },
    take: input?.limit ?? 50,
    orderBy: { confirmationExpiresAt: "asc" },
    select: {
      id: true,
      status: true,
      paymentRecord: {
        select: { id: true },
      },
    },
  })
}

export async function runExpireUnresolvedVouchesJob(input?: {
  now?: Date
  limit?: number
}): Promise<{ expiredCount: number; failedCount: number }> {
  const candidates = await findExpiredUnresolvedVouches(input)
  let expiredCount = 0
  let failedCount = 0

  for (const vouch of candidates) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.vouch.updateMany({
          where: { id: vouch.id, status: { in: ["pending", "active"] } },
          data: { status: "expired", expiredAt: input?.now ?? new Date() },
        })
        await tx.auditEvent.create({
          data: {
            eventName: "vouch.expired",
            actorType: "system",
            entityType: "Vouch",
            entityId: vouch.id,
            participantSafe: true,
            metadata: { source: "expire_vouches_job" },
          },
        })
      })

      if (vouch.paymentRecord) {
        const refund = await refundOrVoidStripePaymentForVouch({
          paymentRecordId: vouch.paymentRecord.id,
          reason: vouch.status === "pending" ? "not_accepted" : "confirmation_incomplete",
          idempotencyKey: `vouch:${vouch.id}:expire_refund_or_void`,
        })
        if (!refund.ok) throw new Error(refund.code)
      }

      expiredCount += 1
    } catch {
      failedCount += 1
      await prisma.vouch.update({
        where: { id: vouch.id },
        data: { status: "failed", failedAt: new Date() },
      })
    }
  }

  return { expiredCount, failedCount }
}
