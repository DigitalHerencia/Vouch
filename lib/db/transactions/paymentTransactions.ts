import "server-only"

import type {
  PaymentIntentPurpose,
  Prisma,
  PrismaClient,
  RefundReason,
  StripePaymentIntentStatus,
  StripeRefundStatus,
} from "@/prisma/generated/prisma/client"

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

type UpsertPaymentRecordTxInput = {
  vouchId: string
  purpose: PaymentIntentPurpose | "customer_authorization"
  providerPaymentIntentId?: string | null
  providerCheckoutSessionId?: string | null
  providerChargeId?: string | null
  status: StripePaymentIntentStatus | string
  settlementStatus?: string
  amountCents: number
  currency: string
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
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

type UpdatePaymentProviderStateTxInput = {
  paymentRecordId: string
  providerPaymentIntentId?: string | null
  providerChargeId?: string | null
  status: StripePaymentIntentStatus | string
  settlementStatus?: string
  amountCapturableCents?: number
  captureBefore?: Date | null
  authorizedAt?: Date | null
  capturedAt?: Date | null
  canceledAt?: Date | null
  failedAt?: Date | null
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
}

type CreateRefundRecordTxInput = {
  vouchId: string
  paymentRecordId: string
  providerRefundId?: string | null
  status: StripeRefundStatus | string
  reason: RefundReason
  amountCents: number
}

function normalizePurpose(purpose: UpsertPaymentRecordTxInput["purpose"]): PaymentIntentPurpose {
  return purpose === "customer_authorization" ? "customer_deposit_authorization" : purpose
}

function normalizeStatus(status: string): StripePaymentIntentStatus {
  if (status === "authorized") return "requires_capture"
  if (status === "captured") return "succeeded"
  if (status === "failed") return "requires_payment_method"
  if (status === "canceled") return "canceled"
  return status as StripePaymentIntentStatus
}

function normalizeRefundStatus(status: string): StripeRefundStatus {
  if (status === "succeeded") return "succeeded"
  if (status === "failed") return "failed"
  if (status === "canceled") return "canceled"
  return "pending"
}

function result<T extends { id: string; vouchId: string | null; status: string }>(
  record: T,
  settlementStatus?: string
) {
  return {
    id: record.id,
    paymentRecordId: record.id,
    vouchId: record.vouchId ?? "",
    status: record.status,
    settlementStatus: settlementStatus ?? record.status,
  }
}

export async function upsertPaymentRecordTx(tx: Tx, input: UpsertPaymentRecordTxInput) {
  const stripePaymentIntentId =
    input.providerPaymentIntentId ??
    input.providerCheckoutSessionId ??
    `${input.vouchId}:${normalizePurpose(input.purpose)}`
  const syncedAt = input.lastProviderSyncAt ?? new Date()
  const update: Prisma.PaymentIntentRecordUpdateInput = {
    status: normalizeStatus(input.status),
    captureBefore: input.captureBefore,
    authorizedAt: input.authorizedAt,
    canceledAt: input.canceledAt,
    failedAt: input.failedAt,
    succeededAt: input.capturedAt,
    syncedAt,
    lastStripeEventId: input.lastErrorCode ?? undefined,
  }

  const record = await tx.paymentIntentRecord.upsert({
    where: { stripePaymentIntentId },
    create: {
      vouchId: input.vouchId,
      purpose: normalizePurpose(input.purpose),
      stripePaymentIntentId,
      stripeCheckoutSessionId: input.providerCheckoutSessionId ?? null,
      amountCents: input.amountCents,
      currency: input.currency,
      status: normalizeStatus(input.status),
      captureMethod: "manual",
      captureBefore: input.captureBefore ?? null,
      authorizedAt: input.authorizedAt ?? null,
      canceledAt: input.canceledAt ?? null,
      failedAt: input.failedAt ?? null,
      succeededAt: input.capturedAt ?? null,
      syncedAt,
    },
    update,
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  return result(record, input.settlementStatus)
}

export async function updatePaymentProviderStateTx(
  tx: Tx,
  input: UpdatePaymentProviderStateTxInput
) {
  const record = await tx.paymentIntentRecord.update({
    where: { id: input.paymentRecordId },
    data: {
      ...(input.providerPaymentIntentId !== undefined
        ? { stripePaymentIntentId: input.providerPaymentIntentId ?? undefined }
        : {}),
      status: normalizeStatus(input.status),
      captureBefore: input.captureBefore,
      authorizedAt: input.authorizedAt,
      canceledAt: input.canceledAt,
      failedAt: input.failedAt,
      succeededAt: input.capturedAt,
      syncedAt: new Date(),
      lastStripeEventId: input.lastErrorCode ?? undefined,
    },
    select: {
      id: true,
      vouchId: true,
      status: true,
    },
  })

  return result(record, input.settlementStatus)
}

export async function createRefundRecordTx(tx: Tx, input: CreateRefundRecordTxInput) {
  return tx.refundRecord.create({
    data: {
      vouchId: input.vouchId,
      paymentIntentRecordId: input.paymentRecordId,
      stripeRefundId: input.providerRefundId ?? `${input.paymentRecordId}:${Date.now()}`,
      amountCents: input.amountCents,
      currency: "usd",
      status: normalizeRefundStatus(input.status),
      reason: input.reason,
    },
    select: {
      id: true,
      vouchId: true,
      paymentIntentRecordId: true,
      status: true,
      reason: true,
      amountCents: true,
    },
  })
}
