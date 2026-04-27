import type { ID, UserID } from "./common"
import type { PaymentStatus, RefundStatus } from "./payment"
import type { UserStatus } from "./setup"
import type { VouchStatus } from "./vouch"

export type AdminRouteSection =
  | "dashboard"
  | "vouches"
  | "users"
  | "payments"
  | "webhooks"
  | "audit"

export type AdminPageVariant =
  | "dashboard"
  | "failure_heavy"
  | "vouch_list"
  | "vouch_detail"
  | "user_list"
  | "user_detail"
  | "payment_list"
  | "payment_detail"
  | "webhook_event_list"
  | "webhook_event_detail"
  | "audit_log"
  | "audit_event_detail"
  | "safe_retry_confirmation"
  | "safe_retry_success"
  | "safe_retry_failure"
  | "unauthorized"

export type AdminSafeRetryOperation =
  | "retry_notification_send"
  | "retry_provider_reconciliation"
  | "retry_webhook_processing"
  | "retry_refund_status_sync"

export interface AdminVouchFilterInput {
  status?: VouchStatus
  paymentStatus?: PaymentStatus
  page?: number
  sort?: "newest" | "oldest" | "deadline" | "failure"
}

export interface AdminUserFilterInput {
  status?: UserStatus
  page?: number
  sort?: "newest" | "oldest"
}

export interface AdminPaymentFilterInput {
  paymentStatus?: PaymentStatus
  refundStatus?: RefundStatus
  page?: number
}

export interface AdminSafeRetryInput {
  operation: AdminSafeRetryOperation
  entityId: ID
  reason?: string
}

export interface AdminDisableUserInput {
  userId: UserID
  reason: string
}
