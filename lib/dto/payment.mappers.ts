import "server-only"

import type { ISODateTime } from "@/types/commonTypes"

type DateLike = Date | string | null | undefined

export type MoneyDTO = {
  cents: number
  currency: string
  display: string
}

export type PaymentRecordParticipantDTO = {
  id: string
  vouchId: string
  purpose: string
  status: string
  amountCents: number
  amount: MoneyDTO
  currency: string
  captureBefore: ISODateTime | null
  authorizedAt: ISODateTime | null
  canceledAt: ISODateTime | null
  failedAt: ISODateTime | null
  succeededAt: ISODateTime | null
  lastProviderSyncAt: ISODateTime | null
  lastErrorCode?: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type RefundRecordParticipantDTO = {
  id: string
  vouchId: string
  paymentRecordId: string | null
  status: string
  reason: string | null
  amountCents: number
  amount: MoneyDTO
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

type PaymentRecordRecord = {
  id: string
  vouchId?: string | null
  purpose?: string
  status: string
  amountCents?: number
  currency?: string
  captureBefore?: DateLike
  authorizedAt?: DateLike
  canceledAt?: DateLike
  failedAt?: DateLike
  succeededAt?: DateLike
  syncedAt?: DateLike
  lastStripeEventId?: string | null
  createdAt?: DateLike
  updatedAt?: DateLike
}

type RefundRecordRecord = {
  id: string
  vouchId?: string | null
  paymentIntentRecordId?: string | null
  status: string
  reason?: string | null
  amountCents: number
  currency?: string
  createdAt?: DateLike
  updatedAt?: DateLike
}

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

  return {
    id: record.id,
    vouchId: record.vouchId ?? "",
    purpose: record.purpose ?? "customer_deposit_authorization",
    status: record.status,
    amountCents,
    amount: toMoneyDTO(amountCents, currency),
    currency,
    captureBefore: toIso(record.captureBefore),
    authorizedAt: toIso(record.authorizedAt),
    canceledAt: toIso(record.canceledAt),
    failedAt: toIso(record.failedAt),
    succeededAt: toIso(record.succeededAt),
    lastProviderSyncAt: toIso(record.syncedAt),
    lastErrorCode: record.lastStripeEventId ?? null,
    createdAt: toIso(record.createdAt) ?? "",
    updatedAt: toIso(record.updatedAt) ?? "",
  }
}

export function mapRefundRecordParticipantDTO(
  record: RefundRecordRecord | null | undefined
): RefundRecordParticipantDTO | null {
  if (!record) return null

  const currency = record.currency ?? "usd"

  return {
    id: record.id,
    vouchId: record.vouchId ?? "",
    paymentRecordId: record.paymentIntentRecordId ?? null,
    status: record.status,
    reason: record.reason ?? null,
    amountCents: record.amountCents,
    amount: toMoneyDTO(record.amountCents, currency),
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
