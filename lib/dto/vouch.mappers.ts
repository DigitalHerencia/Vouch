import "server-only"

import type { ISODateTime } from "@/types/commonTypes"
import type { AggregateConfirmationStatus, ParticipantRole, VouchStatus } from "@/types/vouchTypes"

import {
  mapPaymentRecordParticipantDTO,
  mapRefundRecordParticipantDTOs,
  type MoneyDTO,
  type PaymentRecordParticipantDTO,
  type RefundRecordParticipantDTO,
  toMoneyDTO,
} from "./payment.mappers"

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
  const customerAuthorizationRecord = record.paymentRecords?.[0]
  const currency = record.currency ?? "usd"
  const protectedAmountCents = record.protectedAmountCents ?? 0
  const customerTotalCents = record.customerTotalCents ?? protectedAmountCents

  return {
    id: record.id,
    publicId: record.publicId ?? record.id,
    merchantId: record.merchantId ?? "",
    customerId: record.customerId ?? null,
    status: record.status,
    archiveStatus: record.archiveStatus ?? "active",
    currency,
    protectedAmountCents,
    protectedAmount: toMoneyDTO(protectedAmountCents, currency),
    customerTotalCents,
    customerTotal: toMoneyDTO(customerTotalCents, currency),
    appointmentStartsAt: toIso(record.appointmentStartsAt),
    confirmationOpensAt: toIso(record.confirmationOpensAt),
    confirmationExpiresAt: toIso(record.confirmationExpiresAt),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    merchant: mapSafeUserDTO(record.merchant),
    customer: mapSafeUserDTO(record.customer),
    paymentRecord: mapPaymentRecordParticipantDTO(customerAuthorizationRecord),
    presenceConfirmations: confirmations,
    aggregateConfirmationStatus: getAggregateConfirmationStatus(confirmations),
  }
}

export function mapVouchDetailDTO(record: VouchBaseRecord): VouchDetailDTO {
  const card = mapVouchCardDTO(record)
  const merchantReceivesCents = record.merchantReceivesCents ?? record.protectedAmountCents ?? 0
  const vouchServiceFeeCents = record.vouchServiceFeeCents ?? 0
  const processingFeeOffsetCents = record.processingFeeOffsetCents ?? 0
  const applicationFeeAmountCents = record.applicationFeeAmountCents ?? 0

  return {
    ...card,
    recoveryStatus: record.recoveryStatus ?? "normal",
    merchantReceivesCents,
    merchantReceives: toMoneyDTO(merchantReceivesCents, card.currency),
    vouchServiceFeeCents,
    vouchServiceFee: toMoneyDTO(vouchServiceFeeCents, card.currency),
    processingFeeOffsetCents,
    processingFeeOffset: toMoneyDTO(processingFeeOffsetCents, card.currency),
    applicationFeeAmountCents,
    applicationFeeAmount: toMoneyDTO(applicationFeeAmountCents, card.currency),
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
