import { z } from "zod"
import { isoDateTimeSchema, safeMetadataSchema, userIdSchema } from "./common"

export const analyticsEventGroupSchema = z.enum([
  "acquisition",
  "setup",
  "vouch",
  "payment",
  "notification",
  "admin",
])

export const analyticsEventNameSchema = z.enum([
  "marketing.page_viewed",
  "marketing.cta_clicked",
  "auth.sign_up_started",
  "auth.sign_up_completed",
  "auth.sign_in_completed",
  "setup.checklist_viewed",
  "setup.verification_started",
  "setup.verification_completed",
  "setup.verification_failed",
  "setup.payment_started",
  "setup.payment_ready",
  "setup.payout_started",
  "setup.payout_ready",
  "setup.terms_accepted",
  "vouch.create_started",
  "vouch.create_submitted",
  "vouch.created",
  "vouch.invite_copied",
  "vouch.invite_sent",
  "vouch.invite_opened",
  "vouch.accept_started",
  "vouch.accepted",
  "vouch.declined",
  "vouch.canceled",
  "vouch.confirmation_window_opened",
  "vouch.confirmation_submitted",
  "vouch.partially_confirmed",
  "vouch.completed",
  "vouch.expired",
  "vouch.refunded",
  "vouch.failed",
  "payment.initialized",
  "payment.authorized",
  "payment.release_requested",
  "payment.released",
  "payment.refund_requested",
  "payment.refunded",
  "payment.failed",
  "notification.queued",
  "notification.sent",
  "notification.failed",
  "admin.dashboard_viewed",
  "admin.vouch_viewed",
  "admin.safe_retry_started",
  "admin.safe_retry_completed",
])

export const privacySafeAnalyticsPropertiesSchema = safeMetadataSchema
export const pseudonymousIdSchema = z.string().trim().min(1).max(128).optional()

export const trackAnalyticsEventInputSchema = z.object({
  eventName: analyticsEventNameSchema,
  occurredAt: isoDateTimeSchema.optional(),
  userId: userIdSchema.optional(),
  sessionId: pseudonymousIdSchema,
  requestId: pseudonymousIdSchema,
  properties: privacySafeAnalyticsPropertiesSchema.optional(),
})

export const marketingAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const setupAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const vouchAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const paymentAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const notificationAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const adminAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema