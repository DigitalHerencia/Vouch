import type { z } from "zod"
import type {
  adminAuditFilterInputSchema,
  adminDisableUserInputSchema,
  adminPageVariantSchema,
  adminPaymentFilterInputSchema,
  adminRouteSectionSchema,
  adminSafeRetryInputSchema,
  adminSafeRetryOperationSchema,
  adminUserFilterInputSchema,
  adminVouchFilterInputSchema,
  adminWebhookFilterInputSchema,
} from "@/schemas/admin"

export type AdminRouteSection = z.infer<typeof adminRouteSectionSchema>
export type AdminPageVariant = z.infer<typeof adminPageVariantSchema>
export type AdminSafeRetryOperation = z.infer<typeof adminSafeRetryOperationSchema>
export type AdminVouchFilterInput = z.infer<typeof adminVouchFilterInputSchema>
export type AdminUserFilterInput = z.infer<typeof adminUserFilterInputSchema>
export type AdminPaymentFilterInput = z.infer<typeof adminPaymentFilterInputSchema>
export type AdminWebhookFilterInput = z.infer<typeof adminWebhookFilterInputSchema>
export type AdminAuditFilterInput = z.infer<typeof adminAuditFilterInputSchema>
export type AdminSafeRetryInput = z.infer<typeof adminSafeRetryInputSchema>
export type AdminDisableUserInput = z.infer<typeof adminDisableUserInputSchema>
