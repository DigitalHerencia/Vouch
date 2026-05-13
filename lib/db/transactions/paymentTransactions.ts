import "server-only"

import type {
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  RefundReason,
  RefundStatus,
  SettlementStatus,
} from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export type UpsertPaymentRecordTxInput = {
  vouchId: string
  provider?: PaymentProvider
  providerPaymentIntentId?: string | null
  providerCheckoutSessionId?: string | null
  providerChargeId?: string | null
  providerTransferId?: string | null
  status: PaymentStatus
  settlementStatus: SettlementStatus
  amountCents: number
  currency: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  amountCapturableCents?: number
  captureBefore?: Date | null
  authorizedAt?: Date | null
  capturedAt?: Date | null
  canceledAt?: Date | null
  failedAt?: Date | null
  lastProviderSyncAt?: Date
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
}

export type UpdatePaymentProviderStateTxInput = {
  paymentRecordId: string
  providerPaymentIntentId?: string | null
  providerChargeId?: string | null
  providerTransferId?: string | null
  status: PaymentStatus
  settlementStatus: SettlementStatus
  amountCapturableCents?: number
  captureBefore?: Date | null
  authorizedAt?: Date | null
  capturedAt?: Date | null
  canceledAt?: Date | null
  failedAt?: Date | null
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
}

export type CreateRefundRecordTxInput = {
  vouchId: string
  paymentRecordId: string
  providerRefundId?: string | null
  status: RefundStatus
  reason: RefundReason
  amountCents: number
}

export async function upsertPaymentRecordTx(tx: Tx, input: UpsertPaymentRecordTxInput) {
  const lastProviderSyncAt = input.lastProviderSyncAt ?? new Date()

  return tx.paymentRecord.upsert({
    where: { vouchId: input.vouchId },
    create: {
      vouchId: input.vouchId,
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
    update: {
      providerPaymentIntentId: input.providerPaymentIntentId ?? undefined,
      providerCheckoutSessionId: input.providerCheckoutSessionId ?? undefined,
      providerChargeId: input.providerChargeId ?? undefined,
      providerTransferId: input.providerTransferId ?? undefined,
      status: input.status,
      settlementStatus: input.settlementStatus,
      amountCapturableCents: input.amountCapturableCents ?? undefined,
      captureBefore: input.captureBefore ?? undefined,
      authorizedAt: input.authorizedAt ?? undefined,
      capturedAt: input.capturedAt ?? undefined,
      canceledAt: input.canceledAt ?? undefined,
      failedAt: input.failedAt ?? undefined,
      lastProviderSyncAt,
      lastErrorCode: input.lastErrorCode ?? null,
      lastErrorMessage: input.lastErrorMessage ?? null,
    },
    select: {
      id: true,
      vouchId: true,
      providerPaymentIntentId: true,
      status: true,
      settlementStatus: true,
    },
  })
}

export async function updatePaymentProviderStateTx(
  tx: Tx,
  input: UpdatePaymentProviderStateTxInput
) {
  return tx.paymentRecord.update({
    where: { id: input.paymentRecordId },
    data: {
      providerPaymentIntentId: input.providerPaymentIntentId ?? undefined,
      providerChargeId: input.providerChargeId ?? undefined,
      providerTransferId: input.providerTransferId ?? undefined,
      status: input.status,
      settlementStatus: input.settlementStatus,
      amountCapturableCents: input.amountCapturableCents ?? undefined,
      captureBefore: input.captureBefore ?? undefined,
      authorizedAt: input.authorizedAt ?? undefined,
      capturedAt: input.capturedAt ?? undefined,
      canceledAt: input.canceledAt ?? undefined,
      failedAt: input.failedAt ?? undefined,
      lastProviderSyncAt: new Date(),
      lastErrorCode: input.lastErrorCode ?? null,
      lastErrorMessage: input.lastErrorMessage ?? null,
    },
    select: {
      id: true,
      vouchId: true,
      providerPaymentIntentId: true,
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
      providerRefundId: true,
      status: true,
      reason: true,
      amountCents: true,
    },
  })
}

export async function recordProviderWebhookReceivedTx(
  tx: Tx,
  input: {
    providerEventId: string
    eventType: string
    safeMetadata?: Record<string, unknown>
  }
) {
  try {
    const event = await tx.providerWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: input.providerEventId,
        eventType: input.eventType,
        status: "received",
        processed: false,
        safeMetadata: input.safeMetadata,
      },
      select: { id: true, providerEventId: true, eventType: true, processed: true },
    })

    return { event, duplicate: false }
  } catch (error) {
    const existing = await tx.providerWebhookEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider: "stripe",
          providerEventId: input.providerEventId,
        },
      },
      select: { id: true, providerEventId: true, eventType: true, processed: true },
    })

    if (existing) return { event: existing, duplicate: true }
    throw error
  }
}

export async function markProviderWebhookProcessedTx(tx: Tx, input: { id: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "processed",
      processed: true,
      processedAt: new Date(),
      processingError: null,
    },
  })
}

export async function markProviderWebhookIgnoredTx(tx: Tx, input: { id: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
    },
  })
}

export async function markProviderWebhookFailedTx(tx: Tx, input: { id: string; error: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "failed",
      processed: false,
      processingError: input.error,
    },
  })
}
