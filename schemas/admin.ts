import { z } from "zod"
import { idSchema, optionalTrimmedStringSchema, userIdSchema } from "./common"
import { paymentStatusSchema, refundStatusSchema } from "./payment"
import { userStatusSchema } from "./user"
import { vouchStatusSchema } from "./vouch"

export const adminRouteSectionSchema = z.enum([
  "dashboard",
  "vouches",
  "users",
  "payments",
  "webhooks",
  "audit",
])

export const adminPageVariantSchema = z.enum([
  "dashboard",
  "failure_heavy",
  "vouch_list",
  "vouch_detail",
  "user_list",
  "user_detail",
  "payment_list",
  "payment_detail",
  "webhook_event_list",
  "webhook_event_detail",
  "audit_log",
  "audit_event_detail",
  "safe_retry_confirmation",
  "safe_retry_success",
  "safe_retry_failure",
  "unauthorized",
])

export const adminSafeRetryOperationSchema = z.enum([
  "retry_notification_send",
  "retry_provider_reconciliation",
  "retry_webhook_processing",
  "retry_refund_status_sync",
])

export const sanitizedAdminReasonSchema = z.string().trim().min(1).max(500)
export const sanitizedAdminSortParamSchema = z
  .enum(["newest", "oldest", "deadline", "failure", "created_desc", "created_asc"])
  .optional()

export const redactedProviderReferenceSchema = z.string().max(256).optional()

export const adminVouchFilterInputSchema = z.object({
  status: vouchStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sort: sanitizedAdminSortParamSchema.default("created_desc"),
})

export const adminUserFilterInputSchema = z.object({
  status: userStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
})

export const adminPaymentFilterInputSchema = z.object({
  paymentStatus: paymentStatusSchema.optional(),
  refundStatus: refundStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const adminWebhookFilterInputSchema = z.object({
  eventType: optionalTrimmedStringSchema,
  processed: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const adminAuditFilterInputSchema = z.object({
  entityType: optionalTrimmedStringSchema,
  entityId: optionalTrimmedStringSchema,
  eventName: optionalTrimmedStringSchema,
  page: z.coerce.number().int().min(1).optional(),
})

export const adminSafeRetryInputSchema = z.object({
  operation: adminSafeRetryOperationSchema,
  entityId: idSchema,
  reason: sanitizedAdminReasonSchema.optional(),
})

export const adminDisableUserInputSchema = z.object({
  userId: userIdSchema,
  reason: sanitizedAdminReasonSchema,
})
