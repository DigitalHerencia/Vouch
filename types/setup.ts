export const USER_STATUSES = ["active", "disabled"] as const

export type UserStatus = (typeof USER_STATUSES)[number]

export const VERIFICATION_STATUSES = [
  "unstarted",
  "pending",
  "verified",
  "rejected",
  "requires_action",
  "expired",
] as const

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export const PAYMENT_READINESS_STATUSES = [
  "not_started",
  "requires_action",
  "ready",
  "failed",
] as const

export type PaymentReadinessStatus = (typeof PAYMENT_READINESS_STATUSES)[number]

export const PAYOUT_READINESS_STATUSES = [
  "not_started",
  "requires_action",
  "ready",
  "restricted",
  "failed",
] as const

export type PayoutReadinessStatus = (typeof PAYOUT_READINESS_STATUSES)[number]

export type SetupRequirementKey =
  | "active_user"
  | "identity_verified"
  | "adult_verified"
  | "payment_ready"
  | "payout_ready"
  | "terms_accepted"

export type SetupRequirementStatus = "complete" | "blocked" | "pending" | "not_started"

export type SetupChecklistItem = {
  key: SetupRequirementKey
  label: string
  status: SetupRequirementStatus
  reason: string
  actionHref?: string
  actionLabel?: string
}

export type SetupStatus = {
  userStatus: UserStatus
  identityStatus: VerificationStatus
  adultStatus: VerificationStatus
  paymentReadiness: PaymentReadinessStatus
  payoutReadiness: PayoutReadinessStatus
  termsAccepted: boolean
  canCreateVouch: boolean
  canAcceptVouch: boolean
  checklist: SetupChecklistItem[]
}

export type SetupGateName = "create_vouch" | "accept_vouch" | "confirm_presence" | "settings"

export type SetupBlockerCode =
  | "account_inactive"
  | "identity_verification_required"
  | "adult_verification_required"
  | "payment_method_required"
  | "payout_setup_required"
  | "terms_acceptance_required"
  | "not_participant"
  | "vouch_not_active"
  | "confirmation_window_not_open"
  | "confirmation_window_closed"
  | "duplicate_confirmation"

export type SetupGateResult = {
  gate: SetupGateName
  ok: boolean
  blockers: SetupBlockerCode[]
  status: SetupGateState
  returnTo?: string
}

export type SetupGateState =
  | "incomplete"
  | "complete"
  | "blocked_by_verification"
  | "blocked_by_payment"
  | "blocked_by_payout"
  | "return_from_invite"
  | "return_from_create"

export type ConfirmationGateInput = {
  userStatus: UserStatus
  currentUserId: string
  payerId: string
  payeeId: string | null
  vouchStatus: "pending" | "active" | "completed" | "expired" | "refunded" | "canceled" | "failed"
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  existingConfirmationUserIds: string[]
  now?: Date
}

export type SetupPageState = {
  setup: SetupStatus
  gates: {
    createVouch: SetupGateResult
    acceptVouch: SetupGateResult
    settings: SetupGateResult
  }
  returnTo?: string
  returnState: SetupGateState
}
