import "server-only"

import { prisma } from "@/lib/db/prisma"
import type { VouchRecoverySnapshotReason } from "@/prisma/generated/prisma/client"

import {
  cancelStripeAuthorization,
  captureStripePayment,
} from "@/lib/integrations/stripe/payment-intents"

const DAY_MS = 24 * 60 * 60 * 1000
const BATCH_SIZE = 50
const MAX_CAPTURE_RETRIES = 288

export async function reconcileVouchDeadlines(now = new Date()) {
  const expired = await expireClosedConfirmationWindows(now)
  const capturesRetried = await retryPendingCaptures(now)
  const autoVoided = await autoVoidPastGracePeriod(now)

  return { expired, capturesRetried, autoVoided }
}

export async function createVouchRecoverySnapshot(
  vouchId: string,
  reason: VouchRecoverySnapshotReason
): Promise<void> {
  const vouch = await prisma.vouch.findUniqueOrThrow({
    where: { id: vouchId },
    select: {
      id: true,
      publicId: true,
      merchantId: true,
      customerId: true,
      amountCents: true,
      currency: true,
      appointmentAt: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
      status: true,
      protocolFeePaidAt: true,
      authorizedAt: true,
      capturedAt: true,
      voidedAt: true,
      expiredAt: true,
      archived: true,
      merchantCodeHash: true,
      customerCodeHash: true,
      presenceConfirmation: {
        select: { status: true, canCaptureAt: true, voidedAt: true },
      },
      paymentIntents: {
        where: { purpose: "customer_deposit_authorization" },
        take: 1,
        select: {
          stripePaymentIntentId: true,
          stripeCheckoutSessionId: true,
          stripeCheckoutSessionUrl: true,
          lastStripeEventId: true,
        },
      },
      charges: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { stripeChargeId: true, stripeBalanceTransactionId: true },
      },
    },
  })
  const payment = vouch.paymentIntents[0]
  const charge = vouch.charges[0]

  await prisma.vouchRecoverySnapshot.create({
    data: {
      vouchId: vouch.id,
      publicId: vouch.publicId,
      reason,
      merchantId: vouch.merchantId,
      customerId: vouch.customerId,
      amountCents: vouch.amountCents,
      currency: vouch.currency,
      appointmentAt: vouch.appointmentAt,
      confirmationOpensAt: vouch.confirmationOpensAt,
      confirmationExpiresAt: vouch.confirmationExpiresAt,
      status: vouch.status,
      protocolFeePaidAt: vouch.protocolFeePaidAt,
      authorizedAt: vouch.authorizedAt,
      capturedAt: vouch.capturedAt,
      voidedAt: vouch.voidedAt,
      expiredAt: vouch.expiredAt,
      archived: vouch.archived,
      merchantCodeHash: vouch.merchantCodeHash,
      customerCodeHash: vouch.customerCodeHash,
      ...(vouch.presenceConfirmation?.status
        ? { presenceStatus: vouch.presenceConfirmation.status }
        : {}),
      ...(vouch.presenceConfirmation?.canCaptureAt
        ? { presenceCanCaptureAt: vouch.presenceConfirmation.canCaptureAt }
        : {}),
      ...(vouch.presenceConfirmation?.voidedAt
        ? { presenceVoidedAt: vouch.presenceConfirmation.voidedAt }
        : {}),
      ...(payment?.stripePaymentIntentId
        ? { stripePaymentIntentId: payment.stripePaymentIntentId }
        : {}),
      ...(payment?.stripeCheckoutSessionId
        ? { stripeCheckoutSessionId: payment.stripeCheckoutSessionId }
        : {}),
      ...(payment?.stripeCheckoutSessionUrl
        ? { stripeCheckoutSessionUrl: payment.stripeCheckoutSessionUrl }
        : {}),
      ...(payment?.lastStripeEventId ? { lastStripeEventId: payment.lastStripeEventId } : {}),
      ...(charge?.stripeChargeId ? { stripeChargeId: charge.stripeChargeId } : {}),
      ...(charge?.stripeBalanceTransactionId
        ? { stripeBalanceTransactionId: charge.stripeBalanceTransactionId }
        : {}),
    },
  })
}

async function expireClosedConfirmationWindows(now: Date): Promise<number> {
  const candidates = await prisma.vouch.findMany({
    where: {
      confirmationExpiresAt: { lte: now },
      expiredAt: null,
      capturedAt: null,
      status: { in: ["draft", "protocol_fee_paid", "authorized", "can_capture"] },
    },
    orderBy: { confirmationExpiresAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, appointmentAt: true },
  })

  let expired = 0
  for (const candidate of candidates) {
    const changed = await prisma.$transaction(async (tx) => {
      const update = await tx.vouch.updateMany({
        where: {
          id: candidate.id,
          expiredAt: null,
          capturedAt: null,
          status: { in: ["draft", "protocol_fee_paid", "authorized", "can_capture"] },
        },
        data: { status: "expired", expiredAt: now },
      })

      if (update.count === 0) return false

      await tx.presenceConfirmation.updateMany({
        where: {
          vouchId: candidate.id,
          status: { in: ["pending", "merchant_confirmed", "customer_confirmed"] },
        },
        data: {
          status: "void",
          voidedAt: now,
          resolutionSource: "auto_void",
        },
      })
      await tx.auditEvent.create({
        data: {
          eventName: "vouch.confirmation_window_expired",
          actorType: "system",
          entityType: "Vouch",
          entityId: candidate.id,
        },
      })

      return true
    })

    if (changed) expired += 1
  }

  return expired
}

async function retryPendingCaptures(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - DAY_MS)
  const retries = await prisma.operationalRetry.findMany({
    where: {
      operation: "reconcile_payment_intent",
      status: { in: ["pending", "failed"] },
      attemptCount: { lt: MAX_CAPTURE_RETRIES },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
      vouch: {
        status: { in: ["can_capture", "expired"] },
        appointmentAt: { gt: cutoff },
        presenceConfirmation: {
          status: "can_capture",
          merchantConfirmedAt: { not: null },
          customerConfirmedAt: { not: null },
        },
      },
    },
    orderBy: { nextAttemptAt: "asc" },
    take: BATCH_SIZE,
    select: {
      id: true,
      vouchId: true,
      entityId: true,
      attemptCount: true,
      vouch: {
        select: {
          presenceConfirmation: {
            select: {
              windowOpensAt: true,
              windowClosesAt: true,
              merchantConfirmedAt: true,
              customerConfirmedAt: true,
            },
          },
        },
      },
    },
  })

  let captured = 0
  for (const retry of retries) {
    if (!retry.vouchId) continue
    const presence = retry.vouch?.presenceConfirmation
    if (
      !presence?.merchantConfirmedAt ||
      !presence.customerConfirmedAt ||
      presence.merchantConfirmedAt < presence.windowOpensAt ||
      presence.merchantConfirmedAt > presence.windowClosesAt ||
      presence.customerConfirmedAt < presence.windowOpensAt ||
      presence.customerConfirmedAt > presence.windowClosesAt
    ) {
      continue
    }

    const claim = await prisma.operationalRetry.updateMany({
      where: {
        id: retry.id,
        status: { in: ["pending", "failed"] },
        attemptCount: { lt: MAX_CAPTURE_RETRIES },
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
      },
      data: { status: "processing", lockedAt: now },
    })
    if (claim.count === 0) continue

    const payment = await prisma.paymentIntentRecord.findFirst({
      where: {
        id: retry.entityId,
        vouchId: retry.vouchId,
        purpose: "customer_deposit_authorization",
        status: "requires_capture",
      },
      select: { stripePaymentIntentId: true, stripeAccountId: true },
    })
    if (!payment?.stripePaymentIntentId || !payment.stripeAccountId) {
      await prisma.operationalRetry.update({
        where: { id: retry.id },
        data: { status: "pending", lockedAt: null },
      })
      continue
    }

    try {
      const result = await captureStripePayment({
        providerPaymentIntentId: payment.stripePaymentIntentId,
        connectedAccountId: payment.stripeAccountId,
        idempotencyKey: `vouch:${retry.vouchId}:capture`,
      })
      if (result.status !== "succeeded") throw new Error(`CAPTURE_STATUS_${result.status}`)

      await prisma.$transaction(async (tx) => {
        await tx.paymentIntentRecord.update({
          where: { id: retry.entityId },
          data: { status: "succeeded", succeededAt: now, syncedAt: now },
        })
        await tx.vouch.updateMany({
          where: { id: retry.vouchId!, status: { in: ["can_capture", "expired"] } },
          data: { status: "captured", capturedAt: now },
        })
        await tx.operationalRetry.update({
          where: { id: retry.id },
          data: {
            status: "succeeded",
            attemptCount: { increment: 1 },
            lastAttemptAt: now,
            completedAt: now,
            failureReason: null,
            lockedAt: null,
          },
        })
      })
      captured += 1
    } catch (error) {
      await prisma.operationalRetry.update({
        where: { id: retry.id },
        data: {
          status: "pending",
          attemptCount: { increment: 1 },
          lastAttemptAt: now,
          nextAttemptAt: new Date(now.getTime() + 5 * 60 * 1000),
          failureReason: error instanceof Error ? error.message : String(error),
          lockedAt: null,
        },
      })
    }
  }

  return captured
}

async function autoVoidPastGracePeriod(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - DAY_MS)
  const candidates = await prisma.vouch.findMany({
    where: {
      appointmentAt: { lte: cutoff },
      status: "expired",
      voidedAt: null,
    },
    orderBy: { appointmentAt: "asc" },
    take: BATCH_SIZE,
    select: {
      id: true,
      publicId: true,
      merchantId: true,
      customerId: true,
      amountCents: true,
      currency: true,
      appointmentAt: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
      status: true,
      protocolFeePaidAt: true,
      authorizedAt: true,
      capturedAt: true,
      voidedAt: true,
      expiredAt: true,
      archived: true,
      merchantCodeHash: true,
      customerCodeHash: true,
      presenceConfirmation: {
        select: { status: true, canCaptureAt: true, voidedAt: true },
      },
      paymentIntents: {
        where: { purpose: "customer_deposit_authorization" },
        take: 1,
        select: {
          id: true,
          stripePaymentIntentId: true,
          stripeCheckoutSessionId: true,
          stripeCheckoutSessionUrl: true,
          stripeAccountId: true,
          status: true,
          lastStripeEventId: true,
        },
      },
    },
  })

  let autoVoided = 0
  for (const candidate of candidates) {
    const payment = candidate.paymentIntents[0]

    // Stripe calls stay outside the database transaction so a slow provider cannot hold DB locks.
    if (
      payment?.stripePaymentIntentId &&
      payment.stripeAccountId &&
      payment.status === "requires_capture"
    ) {
      try {
        const canceled = await cancelStripeAuthorization({
          providerPaymentIntentId: payment.stripePaymentIntentId,
          connectedAccountId: payment.stripeAccountId,
          idempotencyKey: `vouch:${candidate.id}:auto-void`,
        })
        if (canceled.status === "succeeded" || canceled.status !== "canceled") continue
      } catch (error) {
        await prisma.auditEvent.create({
          data: {
            eventName: "vouch.authorization_auto_void_failed",
            actorType: "system",
            entityType: "Vouch",
            entityId: candidate.id,
            metadata: {
              reason: error instanceof Error ? error.message.slice(0, 500) : "unknown_error",
            },
          },
        })
        continue
      }
    }

    const changed = await prisma.$transaction(async (tx) => {
      const update = await tx.vouch.updateMany({
        where: { id: candidate.id, status: "expired", voidedAt: null, capturedAt: null },
        data: { voidedAt: now },
      })
      if (update.count === 0) return false

      if (payment) {
        await tx.paymentIntentRecord.update({
          where: { id: payment.id },
          data: { status: "canceled", canceledAt: now, syncedAt: now },
        })
      }

      await tx.presenceConfirmation.upsert({
        where: { vouchId: candidate.id },
        create: {
          vouchId: candidate.id,
          status: "auto_void",
          windowOpensAt: candidate.confirmationOpensAt,
          windowClosesAt: candidate.confirmationExpiresAt,
          voidedAt: now,
          resolutionSource: "auto_void",
        },
        update: {
          status: "auto_void",
          voidedAt: now,
          resolutionSource: "auto_void",
        },
      })
      await tx.vouchRecoverySnapshot.create({
        data: {
          vouchId: candidate.id,
          publicId: candidate.publicId,
          reason: "presence_auto_void",
          merchantId: candidate.merchantId,
          customerId: candidate.customerId,
          amountCents: candidate.amountCents,
          currency: candidate.currency,
          appointmentAt: candidate.appointmentAt,
          confirmationOpensAt: candidate.confirmationOpensAt,
          confirmationExpiresAt: candidate.confirmationExpiresAt,
          status: "expired",
          protocolFeePaidAt: candidate.protocolFeePaidAt,
          authorizedAt: candidate.authorizedAt,
          capturedAt: candidate.capturedAt,
          voidedAt: now,
          expiredAt: candidate.expiredAt,
          archived: candidate.archived,
          presenceStatus: "auto_void",
          presenceVoidedAt: now,
          merchantCodeHash: candidate.merchantCodeHash,
          customerCodeHash: candidate.customerCodeHash,
          ...(candidate.presenceConfirmation?.canCaptureAt
            ? { presenceCanCaptureAt: candidate.presenceConfirmation.canCaptureAt }
            : {}),
          ...(payment?.stripePaymentIntentId
            ? { stripePaymentIntentId: payment.stripePaymentIntentId }
            : {}),
          ...(payment?.stripeCheckoutSessionId
            ? { stripeCheckoutSessionId: payment.stripeCheckoutSessionId }
            : {}),
          ...(payment?.stripeCheckoutSessionUrl
            ? { stripeCheckoutSessionUrl: payment.stripeCheckoutSessionUrl }
            : {}),
          ...(payment?.lastStripeEventId ? { lastStripeEventId: payment.lastStripeEventId } : {}),
        },
      })
      await tx.auditEvent.create({
        data: {
          eventName: "vouch.authorization_auto_voided",
          actorType: "system",
          entityType: "Vouch",
          entityId: candidate.id,
        },
      })

      return true
    })

    if (changed) autoVoided += 1
  }

  return autoVoided
}
