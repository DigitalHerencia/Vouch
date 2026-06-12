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

export const PAYMENT_ROLE_MAP = {
  merchant: "merchant",
  customer: "customer",
} as const

export const CONFIRMATION_STATUS_VALUES = ["pending", "confirmed", "rejected"] as const

export const AGGREGATE_CONFIRMATION_STATUS_VALUES = [
  "none_confirmed",
  "merchant_confirmed",
  "customer_confirmed",
  "both_confirmed",
] as const

export const CONFIRMATION_METHOD_VALUES = ["code_exchange"] as const

export const PAYMENT_PROVIDER_VALUES = ["stripe"] as const
export const WEBHOOK_PROVIDER_VALUES = ["clerk", "stripe"] as const

export const PROVIDER_WEBHOOK_STATUS_VALUES = [
  "received",
  "processing",
  "processed",
  "ignored",
  "failed",
] as const

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

export const SETTLEMENT_STATUS_VALUES = [
  "pending",
  "non_capture_pending",
  "non_captured",
  "capture_pending",
  "captured",
  "refund_pending",
  "refunded",
  "provider_blocked",
  "failed",
] as const

export const REFUND_STATUS_VALUES = ["not_required", "pending", "succeeded", "failed"] as const

export const REFUND_REASON_VALUES = [
  "confirmation_incomplete",
  "provider_required",
  "captured_reversal_required",
  "payment_failure",
] as const

export const ARCHIVE_STATUS_VALUES = ["active", "archived"] as const

export const RECOVERY_STATUS_VALUES = [
  "normal",
  "recovery_required",
  "recovery_in_progress",
  "recovered",
  "recovery_failed",
] as const

export const CONFIRMATION_CODE_BUCKET_SECONDS = 300

export const VOUCH_LIST_STATUS_FILTER_VALUES = [
  "active",
  "archived",
  "captured",
  "expired",
  "all",
] as const

export const VOUCH_LIST_SORT_VALUES = ["newest", "oldest", "deadline"] as const

export const VOUCH_DETAIL_VARIANT_VALUES = [
  "draft",
  "protocol_fee_paid",
  "authorized",
  "can_capture_before_window",
  "can_capture_window_open",
  "merchant_confirmed_waiting_for_customer",
  "customer_confirmed_waiting_for_merchant",
  "both_confirmed_processing_capture",
  "captured",
  "expired",
  "provider_payment_failure",
  "provider_capture_failure",
  "provider_refund_failure",
  "unauthorized_or_not_found",
  "loading",
] as const

export const CONFIRM_PRESENCE_VARIANT_VALUES = [
  "merchant",
  "customer",
  "before_window",
  "window_open",
  "already_confirmed",
  "waiting_for_other_party",
  "both_confirmed_success",
  "window_closed",
  "duplicate_confirmation_error",
  "unauthorized_participant",
  "provider_payment_failure",
] as const

export const PAYMENT_FAILURE_STAGE_VALUES = [
  "create",
  "accept",
  "authorize",
  "confirm",
  "capture",
  "cancel",
  "refund",
  "webhook",
  "unknown",
] as const
