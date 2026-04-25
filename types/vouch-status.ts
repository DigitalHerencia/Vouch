export const VOUCH_STATUSES = [
    "pending",
    "active",
    "completed",
    "expired",
    "refunded",
    "canceled",
    "failed",
] as const

export type VouchStatus = (typeof VOUCH_STATUSES)[number]

export const INVITATION_STATUSES = [
    "created",
    "sent",
    "opened",
    "accepted",
    "declined",
    "expired",
    "invalidated",
] as const

export type InvitationStatus = (typeof INVITATION_STATUSES)[number]

export const PARTICIPANT_ROLES = ["payer", "payee"] as const

export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number]

export const CONFIRMATION_STATUSES = [
    "not_confirmed",
    "confirmed",
    "ineligible",
    "window_not_open",
    "window_closed",
] as const

export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number]

export const AGGREGATE_CONFIRMATION_STATUSES = [
    "none_confirmed",
    "payer_confirmed",
    "payee_confirmed",
    "both_confirmed",
] as const

export type AggregateConfirmationStatus =
    (typeof AGGREGATE_CONFIRMATION_STATUSES)[number]

export const CONFIRMATION_METHODS = ["manual", "gps", "system"] as const

export type ConfirmationMethod = (typeof CONFIRMATION_METHODS)[number]
