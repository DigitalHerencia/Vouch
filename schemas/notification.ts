import { z } from "zod"
import {
  emailSchema,
  idSchema,
  optionalEmailSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
  vouchIdSchema,
} from "./common"

export const notificationChannelSchema = z.enum(["email"])
export const notificationStatusSchema = z.enum(["queued", "sent", "failed", "skipped"])

export const notificationTypeSchema = z.enum([
  "invite",
  "vouch_accepted",
  "confirmation_window_open",
  "confirmation_recorded",
  "vouch_completed",
  "vouch_expired_refunded",
  "payment_failed",
])

export const sanitizedNotificationFailureCodeSchema = optionalTrimmedStringSchema
export const sanitizedProviderMessageIdSchema = optionalTrimmedStringSchema

export const queueNotificationInputSchema = z
  .object({
    type: notificationTypeSchema,
    channel: notificationChannelSchema.default("email"),
    recipientUserId: userIdSchema.optional(),
    recipientEmail: optionalEmailSchema,
    vouchId: vouchIdSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.recipientUserId && !value.recipientEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["recipientEmail"],
        message: "A recipient user ID or recipient email is required.",
      })
    }
  })

export const sendQueuedNotificationInputSchema = z.object({
  notificationEventId: idSchema,
})

export const updateNotificationDeliveryStatusInputSchema = z.object({
  notificationEventId: idSchema,
  status: notificationStatusSchema,
  providerMessageId: sanitizedProviderMessageIdSchema,
  failureCode: sanitizedNotificationFailureCodeSchema,
})

export const notificationFilterInputSchema = z.object({
  recipientUserId: userIdSchema.optional(),
  recipientEmail: emailSchema.optional(),
  vouchId: vouchIdSchema.optional(),
  status: notificationStatusSchema.optional(),
  type: notificationTypeSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})