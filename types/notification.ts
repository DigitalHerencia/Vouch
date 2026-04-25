import type { z } from "zod"
import type {
  notificationChannelSchema,
  notificationStatusSchema,
  notificationTypeSchema,
  queueNotificationInputSchema,
  sendQueuedNotificationInputSchema,
  updateNotificationDeliveryStatusInputSchema,
} from "@/schemas/notification"

export type NotificationChannel = z.infer<typeof notificationChannelSchema>
export type NotificationStatus = z.infer<typeof notificationStatusSchema>
export type NotificationType = z.infer<typeof notificationTypeSchema>
export type QueueNotificationInput = z.infer<typeof queueNotificationInputSchema>
export type SendQueuedNotificationInput = z.infer<typeof sendQueuedNotificationInputSchema>
export type UpdateNotificationDeliveryStatusInput = z.infer<
  typeof updateNotificationDeliveryStatusInputSchema
>