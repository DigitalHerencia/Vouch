import "server-only"

import type { ISODateTime } from "@/types/common"

type DateLike = Date | string | null | undefined

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

export type PaymentRecordParticipantDTO = {
  id: string
  vouchId: string
  provider: string
  providerPaymentIntentId: string | null
  providerCheckoutSessionId: string | null
  status: string
  settlementStatus: string
  amountCents: number
  currency: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  amountCapturableCents: number
  captureBefore: ISODateTime | null
  authorizedAt: ISODateTime | null
  capturedAt: ISODateTime | null
  canceledAt: ISODateTime | null
  failedAt: ISODateTime | null
  lastProviderSyncAt: ISODateTime | null
  lastErrorCode?: string | null
  lastErrorMessage: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type RefundRecordParticipantDTO = {
  id: string
  vouchId: string
  paymentRecordId: string
  providerRefundId: string | null
  status: string
  reason: string | null
  amountCents: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

type PaymentRecordRecord = {
  id: string
  vouchId?: string
  provider?: string
  providerPaymentIntentId?: string | null
  providerCheckoutSessionId?: string | null
  status: string
  settlementStatus: string
  amountCents?: number
  currency?: string
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
  amountCapturableCents?: number
  captureBefore?: DateLike
  authorizedAt?: DateLike
  capturedAt?: DateLike
  canceledAt?: DateLike
  failedAt?: DateLike
  lastProviderSyncAt?: DateLike
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

type RefundRecordRecord = {
  id: string
  vouchId: string
  paymentRecordId: string
  providerRefundId: string | null
  status: string
  reason: string | null
  amountCents: number
  createdAt: Date | string
  updatedAt: Date | string
}

export function mapPaymentRecordParticipantDTO(
  record: PaymentRecordRecord | null | undefined
): PaymentRecordParticipantDTO | null {
  if (!record) return null

  return {
    id: record.id,
    vouchId: record.vouchId ?? "",
    provider: record.provider ?? "stripe",
    providerPaymentIntentId: record.providerPaymentIntentId ?? null,
    providerCheckoutSessionId: record.providerCheckoutSessionId ?? null,
    status: record.status,
    settlementStatus: record.settlementStatus,
    amountCents: record.amountCents ?? 0,
    currency: record.currency ?? "usd",
    protectedAmountCents: record.protectedAmountCents ?? record.amountCents ?? 0,
    merchantReceivesCents: record.merchantReceivesCents ?? record.amountCents ?? 0,
    vouchServiceFeeCents: record.vouchServiceFeeCents ?? 0,
    processingFeeOffsetCents: record.processingFeeOffsetCents ?? 0,
    applicationFeeAmountCents: record.applicationFeeAmountCents ?? 0,
    customerTotalCents: record.customerTotalCents ?? record.amountCents ?? 0,
    amountCapturableCents: record.amountCapturableCents ?? 0,
    captureBefore: toIso(record.captureBefore),
    authorizedAt: toIso(record.authorizedAt),
    capturedAt: toIso(record.capturedAt),
    canceledAt: toIso(record.canceledAt),
    failedAt: toIso(record.failedAt),
    lastProviderSyncAt: toIso(record.lastProviderSyncAt),
    lastErrorCode: record.lastErrorCode ?? null,
    lastErrorMessage: record.lastErrorMessage ?? null,
    createdAt: toIso(record.createdAt) ?? "",
    updatedAt: toIso(record.updatedAt) ?? "",
  }
}

export function mapRefundRecordParticipantDTO(
  record: RefundRecordRecord | null | undefined
): RefundRecordParticipantDTO | null {
  if (!record) return null

  return {
    id: record.id,
    vouchId: record.vouchId,
    paymentRecordId: record.paymentRecordId,
    providerRefundId: record.providerRefundId,
    status: record.status,
    reason: record.reason,
    amountCents: record.amountCents,
    createdAt: toIso(record.createdAt) ?? "",
    updatedAt: toIso(record.updatedAt) ?? "",
  }
}

export function mapRefundRecordParticipantDTOs(
  records: RefundRecordRecord[] | null | undefined
): RefundRecordParticipantDTO[] {
  return (records ?? [])
    .map((record) => mapRefundRecordParticipantDTO(record))
    .filter((record): record is RefundRecordParticipantDTO => Boolean(record))
}
