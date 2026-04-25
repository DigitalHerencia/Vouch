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

export type PaymentReadinessStatus =
    (typeof PAYMENT_READINESS_STATUSES)[number]

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
