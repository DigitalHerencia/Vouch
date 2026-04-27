import type { UserID, VouchID, ID } from "./common"

export type NotificationChannel = "email"

export type NotificationStatus = "queued" | "sent" | "failed" | "skipped"

export type NotificationType =
  | "invite"
  | "vouch_accepted"
  | "confirmation_window_open"
  | "confirmation_recorded"
  | "vouch_completed"
  | "vouch_expired_refunded"
  | "payment_failed"

export interface QueueNotificationInput {
  type: NotificationType
  channel: NotificationChannel
  recipientUserId?: UserID
  recipientEmail?: string
  vouchId?: VouchID
}

export interface SendQueuedNotificationInput {
  notificationEventId: ID
}

export interface UpdateNotificationDeliveryStatusInput {
  notificationEventId: ID
  status: NotificationStatus
  providerMessageId?: string
  failureCode?: string
}
