export const VOUCH_STATUS_VALUES = [
  "draft",
  "protocol_fee_paid",
  "authorized",
  "can_capture",
  "captured",
  "expired",
  "archived",
] as const

export const PARTICIPANT_ROLE_VALUES = ["merchant", "customer"] as const

export const AGGREGATE_CONFIRMATION_STATUS_VALUES = [
  "none_confirmed",
  "merchant_confirmed",
  "customer_confirmed",
  "both_confirmed",
] as const

export const CONFIRMATION_METHOD_VALUES = ["code_exchange"] as const

export const VOUCH_LIMITS = {
  minAmountCents: 500,
  maxAmountCents: 250000,
  inviteTokenBytes: 32,
} as const

export const PAYOUT_READINESS_STATUS_VALUES = [
  "not_started",
  "requires_action",
  "ready",
  "restricted",
  "failed",
] as const

export const PAYMENT_STATUS_VALUES = [
  "not_started",
  "checkout_created",
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
  "requires_capture",
  "authorized",
  "processing",
  "capture_processing",
  "captured",
  "canceled",
  "expired",
  "failed",
] as const

export const REFUND_STATUS_VALUES = ["not_required", "pending", "succeeded", "failed"] as const

export const VOUCH_LIST_SORT_VALUES = ["newest", "oldest", "deadline"] as const
