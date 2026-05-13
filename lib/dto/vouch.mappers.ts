import "server-only"

import type { ISODateTime } from "@/types/common"
import type { AggregateConfirmationStatus, ParticipantRole, VouchStatus } from "@/types/vouch"

import {
  mapPaymentRecordParticipantDTO,
  mapRefundRecordParticipantDTOs,
  type PaymentRecordParticipantDTO,
  type RefundRecordParticipantDTO,
} from "./payment.mappers"

type DateLike = Date | string | null | undefined

function toIso(value: DateLike): ISODateTime | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value.toISOString()
}

type SafeUserRecord = {
  id: string
  displayName: string | null
  email: string | null
  status: string
}

type PresenceConfirmationRecord = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: string
  method: string
  confirmedAt: DateLike
  serverReceivedAt?: DateLike
  timeBucket?: number | null
  clockSkewAccepted?: boolean
  offlinePayloadHash?: string | null
  createdAt: DateLike
}

type InvitationRecord = {
  id: string
  vouchId: string
  status: string
  expiresAt: DateLike
  openedAt: DateLike
  acceptedAt: DateLike
  declinedAt: DateLike
  createdAt: DateLike
  updatedAt: DateLike
}

type VouchBaseRecord = {
  id: string
  publicId?: string
  merchantId?: string
  customerId?: string | null
  status: VouchStatus
  archiveStatus?: string
  recoveryStatus?: string
  currency?: string
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
  label?: string | null
  appointmentStartsAt?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
  committedAt?: DateLike
  sentAt?: DateLike
  acceptedAt?: DateLike
  authorizedAt?: DateLike
  confirmableAt?: DateLike
  completedAt?: DateLike
  expiredAt?: DateLike
  createdAt?: DateLike
  updatedAt?: DateLike
  merchant?: SafeUserRecord
  customer?: SafeUserRecord | null
  invitation?: InvitationRecord | null
  presenceConfirmations?: PresenceConfirmationRecord[]
  paymentRecord?: Parameters<typeof mapPaymentRecordParticipantDTO>[0]
  refundRecords?: Parameters<typeof mapRefundRecordParticipantDTOs>[0]
}

export type SafeUserDTO = {
  id: string
  displayName: string | null
  email: string | null
  status: string
}

export type PresenceConfirmationDTO = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: string
  method: string
  confirmedAt: ISODateTime | null
  serverReceivedAt: ISODateTime | null
  timeBucket: number | null
  clockSkewAccepted: boolean
  offlinePayloadHash: string | null
  createdAt: ISODateTime | null
}

export type InvitationDTO = {
  id: string
  vouchId: string
  status: string
  expiresAt: ISODateTime | null
  openedAt: ISODateTime | null
  acceptedAt: ISODateTime | null
  declinedAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
}

export type VouchCardDTO = {
  id: string
  publicId: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  archiveStatus: string
  currency: string
  protectedAmountCents: number
  customerTotalCents: number
  appointmentStartsAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  createdAt: ISODateTime | null
  updatedAt: ISODateTime | null
  merchant: SafeUserDTO | null
  customer: SafeUserDTO | null
  paymentRecord: PaymentRecordParticipantDTO | null
  presenceConfirmations: PresenceConfirmationDTO[]
  aggregateConfirmationStatus: AggregateConfirmationStatus
}

export type VouchDetailDTO = VouchCardDTO & {
  recoveryStatus: string
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  label: string | null
  committedAt: ISODateTime | null
  sentAt: ISODateTime | null
  acceptedAt: ISODateTime | null
  authorizedAt: ISODateTime | null
  confirmableAt: ISODateTime | null
  completedAt: ISODateTime | null
  expiredAt: ISODateTime | null
  invitation: InvitationDTO | null
  refundRecords: RefundRecordParticipantDTO[]
  windowState: "before_window" | "open" | "closed"
}

export type VouchWindowSummaryDTO = {
  id: string
  status: VouchStatus
  appointmentStartsAt: ISODateTime | null
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  windowState: "before_window" | "open" | "closed"
}

export type VouchConfirmationStateDTO = {
  id: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  confirmationOpensAt: ISODateTime | null
  confirmationExpiresAt: ISODateTime | null
  presenceConfirmations: PresenceConfirmationDTO[]
  aggregateConfirmationStatus: AggregateConfirmationStatus
  windowState: "before_window" | "open" | "closed"
  merchantConfirmed: boolean
  customerConfirmed: boolean
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

function mapPresenceConfirmationDTO(record: PresenceConfirmationRecord): PresenceConfirmationDTO {
  return {
    id: record.id,
    vouchId: record.vouchId,
    userId: record.userId,
    participantRole: record.participantRole,
    status: record.status,
    method: record.method,
    confirmedAt: toIso(record.confirmedAt),
    serverReceivedAt: toIso(record.serverReceivedAt),
    timeBucket: record.timeBucket ?? null,
    clockSkewAccepted: record.clockSkewAccepted ?? false,
    offlinePayloadHash: record.offlinePayloadHash ?? null,
    createdAt: toIso(record.createdAt),
  }
}

function mapInvitationDTO(record: InvitationRecord | null | undefined): InvitationDTO | null {
  if (!record) return null

  return {
    id: record.id,
    vouchId: record.vouchId,
    status: record.status,
    expiresAt: toIso(record.expiresAt),
    openedAt: toIso(record.openedAt),
    acceptedAt: toIso(record.acceptedAt),
    declinedAt: toIso(record.declinedAt),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  }
}

export function getAggregateConfirmationStatus(
  confirmations: PresenceConfirmationDTO[]
): AggregateConfirmationStatus {
  const merchantConfirmed = confirmations.some(
    (confirmation) =>
      confirmation.participantRole === "merchant" && confirmation.status === "confirmed"
  )
  const customerConfirmed = confirmations.some(
    (confirmation) =>
      confirmation.participantRole === "customer" && confirmation.status === "confirmed"
  )

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
  const confirmations = (record.presenceConfirmations ?? []).map(mapPresenceConfirmationDTO)

  return {
    id: record.id,
    publicId: record.publicId ?? record.id,
    merchantId: record.merchantId ?? "",
    customerId: record.customerId ?? null,
    status: record.status,
    archiveStatus: record.archiveStatus ?? "active",
    currency: record.currency ?? "usd",
    protectedAmountCents: record.protectedAmountCents ?? 0,
    customerTotalCents: record.customerTotalCents ?? record.protectedAmountCents ?? 0,
    appointmentStartsAt: toIso(record.appointmentStartsAt),
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    merchant: mapSafeUserDTO(record.merchant),
    customer: mapSafeUserDTO(record.customer),
    paymentRecord: mapPaymentRecordParticipantDTO(record.paymentRecord),
    presenceConfirmations: confirmations,
    aggregateConfirmationStatus: getAggregateConfirmationStatus(confirmations),
  }
}

export function mapVouchDetailDTO(record: VouchBaseRecord): VouchDetailDTO {
  const card = mapVouchCardDTO(record)

  return {
    ...card,
    recoveryStatus: record.recoveryStatus ?? "normal",
    merchantReceivesCents: record.merchantReceivesCents ?? record.protectedAmountCents ?? 0,
    vouchServiceFeeCents: record.vouchServiceFeeCents ?? 0,
    processingFeeOffsetCents: record.processingFeeOffsetCents ?? 0,
    applicationFeeAmountCents: record.applicationFeeAmountCents ?? 0,
    label: record.label ?? null,
    committedAt: toIso(record.committedAt),
    sentAt: toIso(record.sentAt),
    acceptedAt: toIso(record.acceptedAt),
    authorizedAt: toIso(record.authorizedAt),
    confirmableAt: toIso(record.confirmableAt),
    completedAt: toIso(record.completedAt),
    expiredAt: toIso(record.expiredAt),
    invitation: mapInvitationDTO(record.invitation),
    refundRecords: mapRefundRecordParticipantDTOs(record.refundRecords),
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
    appointmentStartsAt: toIso(record.appointmentStartsAt),
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    windowState: getWindowState({
      confirmationOpensAt: record.confirmationOpensAt,
      confirmationExpiresAt: record.confirmationExpiresAt,
    }),
  }
}

export function mapVouchConfirmationStateDTO(record: VouchBaseRecord): VouchConfirmationStateDTO {
  const confirmations = (record.presenceConfirmations ?? []).map(mapPresenceConfirmationDTO)
  const aggregateConfirmationStatus = getAggregateConfirmationStatus(confirmations)

  return {
    id: record.id,
    merchantId: record.merchantId ?? "",
    customerId: record.customerId ?? null,
    status: record.status,
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    presenceConfirmations: confirmations,
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
