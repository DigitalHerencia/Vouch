import "server-only"

import type { ISODateTime } from "@/types/commonTypes"

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

export function toMoneyDTO(
  cents: number | null | undefined,
  currency: string | null | undefined
): MoneyDTO {
  const safeCents = Number.isFinite(cents) ? Math.trunc(cents ?? 0) : 0
  const safeCurrency = currency ?? "usd"

  return {
    cents: safeCents,
    currency: safeCurrency,
    display: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency.toUpperCase(),
    }).format(safeCents / 100),
  }
}

export function mapPaymentRecordParticipantDTO(
  record: PaymentRecordRecord | null | undefined
): PaymentRecordParticipantDTO | null {
  if (!record) return null

  const currency = record.currency ?? "usd"
  const amountCents = record.amountCents ?? 0
  const protectedAmountCents = record.protectedAmountCents ?? amountCents
  const merchantReceivesCents = record.merchantReceivesCents ?? amountCents
  const vouchServiceFeeCents = record.vouchServiceFeeCents ?? 0
  const processingFeeOffsetCents = record.processingFeeOffsetCents ?? 0
  const applicationFeeAmountCents = record.applicationFeeAmountCents ?? 0
  const customerTotalCents = record.customerTotalCents ?? amountCents
  const amountCapturableCents = record.amountCapturableCents ?? 0

  return {
    id: record.id,
    vouchId: record.vouchId ?? "",
    provider: record.provider ?? "stripe",
    purpose: record.purpose ?? "customer_authorization",
    status: record.status,
    settlementStatus: record.settlementStatus,
    amountCents,
    amount: toMoneyDTO(amountCents, currency),
    currency,
    protectedAmountCents,
    protectedAmount: toMoneyDTO(protectedAmountCents, currency),
    merchantReceivesCents,
    merchantReceives: toMoneyDTO(merchantReceivesCents, currency),
    vouchServiceFeeCents,
    vouchServiceFee: toMoneyDTO(vouchServiceFeeCents, currency),
    processingFeeOffsetCents,
    processingFeeOffset: toMoneyDTO(processingFeeOffsetCents, currency),
    applicationFeeAmountCents,
    applicationFeeAmount: toMoneyDTO(applicationFeeAmountCents, currency),
    customerTotalCents,
    customerTotal: toMoneyDTO(customerTotalCents, currency),
    amountCapturableCents,
    amountCapturable: toMoneyDTO(amountCapturableCents, currency),
    captureBefore: toIso(record.captureBefore),
    authorizedAt: toIso(record.authorizedAt),
    capturedAt: toIso(record.capturedAt),
    canceledAt: toIso(record.canceledAt),
    failedAt: toIso(record.failedAt),
    lastProviderSyncAt: toIso(record.lastProviderSyncAt),
    lastErrorCode: record.lastErrorCode ?? null,
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
    status: record.status,
    reason: record.reason,
    amountCents: record.amountCents,
    amount: toMoneyDTO(record.amountCents, record.currency),
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
