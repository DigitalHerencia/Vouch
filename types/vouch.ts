import type {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  ARCHIVE_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  CONFIRMATION_STATUS_VALUES,
  CONFIRM_PRESENCE_VARIANT_VALUES,
  INVITATION_STATUS_VALUES,
  PARTICIPANT_ROLE_VALUES,
  PAYMENT_ROLE_MAP,
  RECOVERY_STATUS_VALUES,
  VOUCH_DETAIL_VARIANT_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_LIST_STATUS_FILTER_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"

import type { CurrencyCode, ISODateTime, MoneyCents, VouchID } from "./common"

export type VouchStatus = (typeof VOUCH_STATUS_VALUES)[number]
export type InvitationStatus = (typeof INVITATION_STATUS_VALUES)[number]
export type ParticipantRole = (typeof PARTICIPANT_ROLE_VALUES)[number]
export type PaymentRoleAlias = (typeof PAYMENT_ROLE_MAP)[ParticipantRole]
export type ConfirmationStatus = (typeof CONFIRMATION_STATUS_VALUES)[number]
export type AggregateConfirmationStatus = (typeof AGGREGATE_CONFIRMATION_STATUS_VALUES)[number]
export type ConfirmationMethod = (typeof CONFIRMATION_METHOD_VALUES)[number]
export type ArchiveStatus = (typeof ARCHIVE_STATUS_VALUES)[number]
export type RecoveryStatus = (typeof RECOVERY_STATUS_VALUES)[number]

export type VouchListStatusFilter = (typeof VOUCH_LIST_STATUS_FILTER_VALUES)[number]
export type VouchListSort = (typeof VOUCH_LIST_SORT_VALUES)[number]
export type VouchDetailVariant = (typeof VOUCH_DETAIL_VARIANT_VALUES)[number]
export type ConfirmPresenceVariant = (typeof CONFIRM_PRESENCE_VARIANT_VALUES)[number]

export interface CreateVouchDraftInput {
  amountCents: MoneyCents
  currency: CurrencyCode
  appointmentStartsAt: ISODateTime
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
}

export interface ConfirmCreateVouchInput extends CreateVouchDraftInput {
  disclaimerAccepted: true
}

export interface FeePreviewInput {
  amountCents: MoneyCents
  currency: CurrencyCode
}

export interface ConfirmPresenceInput {
  vouchId: VouchID
  submittedCode: string
  method: ConfirmationMethod
}

export interface ArchiveVouchInput {
  vouchId: VouchID
}

export interface VouchListQuery {
  status?: VouchListStatusFilter
  page?: number
  sort?: VouchListSort
}

export interface VouchAppointmentDTO {
  appointmentStartsAt: ISODateTime
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
  appointmentLabel: string
  confirmationWindowLabel: string
}

export interface VouchConfirmationDTO {
  aggregateStatus: AggregateConfirmationStatus
  merchantConfirmed: boolean
  customerConfirmed: boolean
  windowState: "before_window" | "open" | "closed"
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
  canCurrentUserConfirm: boolean
  consequenceText: string
}

export interface VouchActionDTO {
  id: string
  label: string
  description?: string
  disabled?: boolean
  reason?: string
}

export interface VouchTimelineItemDTO {
  id: string
  label: string
  body: string
  occurredAt: ISODateTime
  participantSafe: boolean
}

/**
 * Backward-compatible aliases retained only to keep Pass 4 isolated.
 * Later passes should migrate call sites to CreateVouchDraftInput / ConfirmCreateVouchInput.
 */
export type CreateVouchInput = ConfirmCreateVouchInput
export type AcceptVouchInput = {
  vouchId: VouchID
  disclaimerAccepted: true
}
