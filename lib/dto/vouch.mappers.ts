import "server-only"

import type { VouchStatus } from "@/prisma/generated/prisma/client"
import type { ISODateTime } from "@/types/commonTypes"

import {
  mapPaymentRecordParticipantDTO,
  mapRefundRecordParticipantDTOs,
  type MoneyDTO,
  type PaymentRecordParticipantDTO,
  type RefundRecordParticipantDTO,
  toMoneyDTO,
} from "./payment.mappers"

type DateLike = Date | string | null | undefined

type SafeUserRecord = {
  id: string
  displayName: string | null
  email: string | null
  status: string
}

export type SafeUserDTO = SafeUserRecord

type PresenceConfirmationRecord = {
  id: string
  vouchId: string
  status: string
  windowOpensAt?: DateLike
  windowClosesAt?: DateLike
  merchantConfirmedAt?: DateLike
  customerConfirmedAt?: DateLike
  canCaptureAt?: DateLike
  voidedAt?: DateLike
  createdAt?: DateLike
  updatedAt?: DateLike
}

export type PresenceConfirmationDTO = {
  id: string
  vouchId: string
  status: string
  windowOpensAt: ISODateTime | null
  windowClosesAt: ISODateTime | null
  merchantConfirmedAt: ISODateTime | null
  customerConfirmedAt: ISODateTime | null
  canCaptureAt: ISODateTime | null
  voidedAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
}

export type AggregateConfirmationStatus =
  | "none_confirmed"
  | "merchant_confirmed"
  | "customer_confirmed"
  | "both_confirmed"

type VouchBaseRecord = {
  id: string
  publicId?: string
  merchantId?: string
  customerId?: string | null
  status: VouchStatus | string
  archived?: boolean
  currency?: string
  amountCents?: number
  appointmentAt?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
  disclaimerAcceptedAt?: DateLike
  protocolFeePaidAt?: DateLike
  authorizedAt?: DateLike
  capturedAt?: DateLike
  voidedAt?: DateLike
  expiredAt?: DateLike
  archivedAt?: DateLike
  createdAt?: DateLike
  updatedAt?: DateLike
  merchant?: SafeUserRecord
  customer?: SafeUserRecord | null
  presenceConfirmation?: PresenceConfirmationRecord | null
  paymentIntents?: Parameters<typeof mapPaymentRecordParticipantDTO>[0][]
  refunds?: Parameters<typeof mapRefundRecordParticipantDTOs>[0]
}

export type VouchCardDTO = {
  id: string
  publicId: string
  merchantId: string
  customerId: string | null
  status: string
  archived: boolean
  currency: string
  amountCents: number
  amount: MoneyDTO
  appointmentAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
  merchant: SafeUserDTO | null
  customer: SafeUserDTO | null
  paymentRecord: PaymentRecordParticipantDTO | null
  presenceConfirmation: PresenceConfirmationDTO | null
  aggregateConfirmationStatus: AggregateConfirmationStatus
  protocolFeePaidAt: ISODateTime | null
}

export type VouchDetailDTO = VouchCardDTO & {
  protocolFeePaidAt: ISODateTime | null
  authorizedAt: ISODateTime | null
  capturedAt: ISODateTime | null
  voidedAt: ISODateTime | null
  expiredAt: ISODateTime | null
  archivedAt: ISODateTime | null
  refundRecords: RefundRecordParticipantDTO[]
  windowState: "before_window" | "open" | "closed"
}

export type VouchWindowSummaryDTO = {
  id: string
  status: string
  appointmentAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  windowState: "before_window" | "open" | "closed"
}

export type VouchConfirmationStateDTO = {
  id: string
  merchantId: string
  customerId: string | null
  status: string
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  presenceConfirmation: PresenceConfirmationDTO | null
  aggregateConfirmationStatus: AggregateConfirmationStatus
  windowState: "before_window" | "open" | "closed"
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

function mapSafeUserDTO(record: SafeUserRecord | null | undefined): SafeUserDTO | null {
  if (!record) return null
  return {
    id: record.id,
    displayName: record.displayName,
    email: record.email,
    status: record.status,
  }
}

function mapPresenceConfirmationDTO(
  record: PresenceConfirmationRecord | null | undefined
): PresenceConfirmationDTO | null {
  if (!record) return null

  return {
    id: record.id,
    vouchId: record.vouchId,
    status: record.status,
    windowOpensAt: toIso(record.windowOpensAt),
    windowClosesAt: toIso(record.windowClosesAt),
    merchantConfirmedAt: toIso(record.merchantConfirmedAt),
    customerConfirmedAt: toIso(record.customerConfirmedAt),
    canCaptureAt: toIso(record.canCaptureAt),
    voidedAt: toIso(record.voidedAt),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  }
}

export function getAggregateConfirmationStatus(
  confirmation: PresenceConfirmationDTO | PresenceConfirmationDTO[] | null | undefined
): AggregateConfirmationStatus {
  const confirmations = Array.isArray(confirmation)
    ? confirmation
    : confirmation
      ? [confirmation]
      : []
  const merchantConfirmed = confirmations.some((item) => Boolean(item.merchantConfirmedAt))
  const customerConfirmed = confirmations.some((item) => Boolean(item.customerConfirmedAt))

  if (merchantConfirmed && customerConfirmed) return "both_confirmed"
  if (merchantConfirmed) return "merchant_confirmed"
  if (customerConfirmed) return "customer_confirmed"
  return "none_confirmed"
}

export function getWindowState(input: {
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
  now?: Date
}): "before_window" | "open" | "closed" {
  const now = input.now?.getTime() ?? Date.now()
  const opensAt = input.confirmationOpensAt ? new Date(input.confirmationOpensAt).getTime() : 0
  const expiresAt = input.confirmationExpiresAt
    ? new Date(input.confirmationExpiresAt).getTime()
    : 0

  if (opensAt && now < opensAt) return "before_window"
  if (expiresAt && now > expiresAt) return "closed"
  return "open"
}

export function mapVouchCardDTO(record: VouchBaseRecord): VouchCardDTO {
  const presenceConfirmation = mapPresenceConfirmationDTO(record.presenceConfirmation)
  const customerAuthorizationRecord = record.paymentIntents?.[0]
  const currency = record.currency ?? "usd"
  const amountCents = record.amountCents ?? 0

  return {
    id: record.id,
    publicId: record.publicId ?? record.id,
    merchantId: record.merchantId ?? "",
    customerId: record.customerId ?? null,
    status: record.status,
    archived: record.archived ?? false,
    currency,
    amountCents,
    amount: toMoneyDTO(amountCents, currency),
    appointmentAt: toIso(record.appointmentAt),
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    merchant: mapSafeUserDTO(record.merchant),
    customer: mapSafeUserDTO(record.customer),
    paymentRecord: mapPaymentRecordParticipantDTO(customerAuthorizationRecord),
    presenceConfirmation,
    aggregateConfirmationStatus: getAggregateConfirmationStatus(presenceConfirmation),
    protocolFeePaidAt: toIso(record.protocolFeePaidAt),
  }
}

export function mapVouchDetailDTO(record: VouchBaseRecord): VouchDetailDTO {
  const card = mapVouchCardDTO(record)

  return {
    ...card,
    protocolFeePaidAt: toIso(record.protocolFeePaidAt),
    authorizedAt: toIso(record.authorizedAt),
    capturedAt: toIso(record.capturedAt),
    voidedAt: toIso(record.voidedAt),
    expiredAt: toIso(record.expiredAt),
    archivedAt: toIso(record.archivedAt),
    refundRecords: mapRefundRecordParticipantDTOs(record.refunds),
    windowState: getWindowState({
      confirmationOpensAt: record.confirmationOpensAt,
      confirmationExpiresAt: record.confirmationExpiresAt,
    }),
  }
}

export function mapVouchWindowSummaryDTO(record: VouchBaseRecord): VouchWindowSummaryDTO {
  return {
    id: record.id,
    status: record.status,
    appointmentAt: toIso(record.appointmentAt),
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    windowState: getWindowState({
      confirmationOpensAt: record.confirmationOpensAt,
      confirmationExpiresAt: record.confirmationExpiresAt,
    }),
  }
}

export function mapVouchConfirmationStateDTO(record: VouchBaseRecord): VouchConfirmationStateDTO {
  const presenceConfirmation = mapPresenceConfirmationDTO(record.presenceConfirmation)
  const aggregateConfirmationStatus = getAggregateConfirmationStatus(presenceConfirmation)

  return {
    id: record.id,
    merchantId: record.merchantId ?? "",
    customerId: record.customerId ?? null,
    status: record.status,
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    presenceConfirmation,
    aggregateConfirmationStatus,
    windowState: getWindowState({
      confirmationOpensAt: record.confirmationOpensAt,
      confirmationExpiresAt: record.confirmationExpiresAt,
    }),
    merchantConfirmed:
      aggregateConfirmationStatus === "merchant_confirmed" ||
      aggregateConfirmationStatus === "both_confirmed",
    customerConfirmed:
      aggregateConfirmationStatus === "customer_confirmed" ||
      aggregateConfirmationStatus === "both_confirmed",
  }
}
