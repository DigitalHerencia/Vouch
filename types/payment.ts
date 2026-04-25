export const PAYMENT_PROVIDERS = ["stripe"] as const

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number]

export const PAYMENT_STATUSES = [
    "not_started",
    "requires_payment_method",
    "authorized",
    "captured",
    "release_pending",
    "released",
    "refund_pending",
    "refunded",
    "voided",
    "failed",
] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const REFUND_STATUSES = ["not_required", "pending", "succeeded", "failed"] as const

export type RefundStatus = (typeof REFUND_STATUSES)[number]

export const REFUND_REASONS = [
    "not_accepted",
    "confirmation_incomplete",
    "canceled_before_acceptance",
    "payment_failure",
    "provider_required",
] as const

export type RefundReason = (typeof REFUND_REASONS)[number]

export type MoneyAmount = {
    amountCents: number
    currency: "usd"
}

export type FeeBreakdown = {
    amountCents: number
    platformFeeCents: number
    totalCents: number
    currency: "usd"
}
