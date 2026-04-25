export const ADMIN_SAFE_RETRY_OPERATIONS = [
  "retry_notification_send",
  "retry_provider_reconciliation",
  "retry_webhook_processing",
  "retry_refund_status_sync",
] as const