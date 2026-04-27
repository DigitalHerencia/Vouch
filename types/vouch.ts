import type { CurrencyCode, InvitationToken, ISODateTime, MoneyCents, VouchID } from "./common"

export type VouchStatus =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "refunded"
  | "canceled"
  | "failed"

export type InvitationStatus =
  | "created"
  | "sent"
  | "opened"
  | "accepted"
  | "declined"
  | "expired"
  | "invalidated"

export type ParticipantRole = "payer" | "payee"

export type ConfirmationStatus =
  | "not_confirmed"
  | "confirmed"
  | "ineligible"
  | "window_not_open"
  | "window_closed"

export type AggregateConfirmationStatus =
  | "none_confirmed"
  | "payer_confirmed"
  | "payee_confirmed"
  | "both_confirmed"

export type ConfirmationMethod = "manual" | "gps" | "system"

export type RecipientMethod = "email" | "share_link"

export interface CreateVouchInput {
  amountCents: MoneyCents
  currency: CurrencyCode
  meetingStartsAt: ISODateTime
  confirmationOpensAt: ISODateTime
  confirmationExpiresAt: ISODateTime
  recipientMethod: RecipientMethod
  recipientEmail?: string
  label?: string
  privateNote?: string
  acceptedTerms: boolean
}

export interface FeePreviewInput {
  amountCents: MoneyCents
  currency: CurrencyCode
}

export interface SendVouchInvitationInput {
  vouchId: VouchID
  recipientEmail: string
}

export interface ResendVouchInvitationInput {
  vouchId: VouchID
}

export interface InviteTokenInput {
  token: InvitationToken
}

export interface AcceptVouchInput {
  token: InvitationToken
  acceptedTerms: boolean
}

export interface DeclineVouchInput {
  token: InvitationToken
  reason?: string
}

export interface CancelPendingVouchInput {
  vouchId: VouchID
  reason?: string
}

export interface ConfirmPresenceInput {
  vouchId: VouchID
  participantRole: ParticipantRole
  method: ConfirmationMethod
}

export interface VouchListQuery {
  status?: VouchListStatusFilter
  page?: number
  sort?: VouchListSort
}

export type VouchListStatusFilter =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "refunded"
  | "action_required"
  | "all"

export type VouchListSort = "newest" | "oldest" | "deadline"

export type VouchDetailVariant =
  | "pending_payer"
  | "pending_invite_sent"
  | "active_before_window"
  | "active_window_open"
  | "payer_confirmed_waiting_for_payee"
  | "payee_confirmed_waiting_for_payer"
  | "both_confirmed_processing_release"
  | "completed"
  | "expired"
  | "refunded"
  | "failed_payment"
  | "failed_release"
  | "failed_refund"
  | "unauthorized_or_not_found"
  | "loading"

export type ConfirmPresenceVariant =
  | "payer"
  | "payee"
  | "before_window"
  | "window_open"
  | "already_confirmed"
  | "waiting_for_other_party"
  | "both_confirmed_success"
  | "window_closed"
  | "duplicate_confirmation_error"
  | "unauthorized_participant"
  | "provider_payment_failure"
