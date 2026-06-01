import "server-only"

import type {
  PaymentProvider,
  PaymentRecordPurpose,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RefundReason,
  RefundStatus,
  SettlementStatus,
} from "@/prisma/generated/prisma/client"

export async function upsertPaymentRecordTx(tx: Tx, input: UpsertPaymentRecordTxInput) {
  const lastProviderSyncAt = input.lastProviderSyncAt ?? new Date()
  const update: Prisma.PaymentRecordUpdateInput = {
    status: input.status,
    settlementStatus: input.settlementStatus,
    lastProviderSyncAt,
    lastErrorCode: input.lastErrorCode ?? null,
    lastErrorMessage: input.lastErrorMessage ?? null,
  }

  if (input.providerPaymentIntentId !== undefined) {
    update.providerPaymentIntentId = input.providerPaymentIntentId
  }
  if (input.providerCheckoutSessionId !== undefined) {
    update.providerCheckoutSessionId = input.providerCheckoutSessionId
  }
  if (input.providerChargeId !== undefined) update.providerChargeId = input.providerChargeId
  if (input.providerTransferId !== undefined) update.providerTransferId = input.providerTransferId
  if (input.amountCapturableCents !== undefined) {
    update.amountCapturableCents = input.amountCapturableCents
  }
  if (input.captureBefore !== undefined) update.captureBefore = input.captureBefore
  if (input.authorizedAt !== undefined) update.authorizedAt = input.authorizedAt
  if (input.capturedAt !== undefined) update.capturedAt = input.capturedAt
  if (input.canceledAt !== undefined) update.canceledAt = input.canceledAt
  if (input.failedAt !== undefined) update.failedAt = input.failedAt

  return tx.paymentRecord.upsert({
    where: { vouchId_purpose: { vouchId: input.vouchId, purpose: input.purpose } },
    create: {
      vouchId: input.vouchId,
      purpose: input.purpose,
      provider: input.provider ?? "stripe",
      providerPaymentIntentId: input.providerPaymentIntentId ?? null,
      providerCheckoutSessionId: input.providerCheckoutSessionId ?? null,
      providerChargeId: input.providerChargeId ?? null,
      providerTransferId: input.providerTransferId ?? null,
      status: input.status,
      settlementStatus: input.settlementStatus,
      amountCents: input.amountCents,
      currency: input.currency,
      protectedAmountCents: input.protectedAmountCents,
      merchantReceivesCents: input.merchantReceivesCents,
      vouchServiceFeeCents: input.vouchServiceFeeCents,
      processingFeeOffsetCents: input.processingFeeOffsetCents,
      applicationFeeAmountCents: input.applicationFeeAmountCents,
      customerTotalCents: input.customerTotalCents,
      amountCapturableCents: input.amountCapturableCents ?? 0,
      captureBefore: input.captureBefore ?? null,
      authorizedAt: input.authorizedAt ?? null,
      capturedAt: input.capturedAt ?? null,
      canceledAt: input.canceledAt ?? null,
      failedAt: input.failedAt ?? null,
      lastProviderSyncAt,
      lastErrorCode: input.lastErrorCode ?? null,
      lastErrorMessage: input.lastErrorMessage ?? null,
    },
    update,
    select: {
      id: true,
      vouchId: true,
      status: true,
      settlementStatus: true,
    },
  })
}

export async function updatePaymentProviderStateTx(
  tx: Tx,
  input: UpdatePaymentProviderStateTxInput
) {
  const data: Prisma.PaymentRecordUpdateInput = {
    status: input.status,
    settlementStatus: input.settlementStatus,
    lastProviderSyncAt: new Date(),
    lastErrorCode: input.lastErrorCode ?? null,
    lastErrorMessage: input.lastErrorMessage ?? null,
  }

  if (input.providerPaymentIntentId !== undefined) {
    data.providerPaymentIntentId = input.providerPaymentIntentId
  }
  if (input.providerChargeId !== undefined) data.providerChargeId = input.providerChargeId
  if (input.providerTransferId !== undefined) data.providerTransferId = input.providerTransferId
  if (input.amountCapturableCents !== undefined) {
    data.amountCapturableCents = input.amountCapturableCents
  }
  if (input.captureBefore !== undefined) data.captureBefore = input.captureBefore
  if (input.authorizedAt !== undefined) data.authorizedAt = input.authorizedAt
  if (input.capturedAt !== undefined) data.capturedAt = input.capturedAt
  if (input.canceledAt !== undefined) data.canceledAt = input.canceledAt
  if (input.failedAt !== undefined) data.failedAt = input.failedAt

  return tx.paymentRecord.update({
    where: { id: input.paymentRecordId },
    data,
    select: {
      id: true,
      vouchId: true,
      status: true,
      settlementStatus: true,
    },
  })
}

export async function createRefundRecordTx(tx: Tx, input: CreateRefundRecordTxInput) {
  return tx.refundRecord.create({
    data: {
      vouchId: input.vouchId,
      paymentRecordId: input.paymentRecordId,
      providerRefundId: input.providerRefundId ?? null,
      status: input.status,
      reason: input.reason,
      amountCents: input.amountCents,
    },
    select: {
      id: true,
      vouchId: true,
      paymentRecordId: true,
      status: true,
      reason: true,
      amountCents: true,
    },
  })
}
