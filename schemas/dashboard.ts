import { z } from "zod"
import { vouchListSortSchema } from "./vouch"

export const dashboardSectionIdSchema = z.enum([
  "action_required",
  "active",
  "pending",
  "completed",
  "expired_refunded",
])

export const dashboardVariantSchema = z.enum([
  "empty",
  "action_required",
  "active_vouches",
  "mixed_vouch_states",
  "payer_focused",
  "payee_focused",
  "loading",
  "error",
])

export const sanitizedDashboardStatusParamSchema = dashboardSectionIdSchema
  .or(z.literal("all"))
  .optional()

export const sanitizedDashboardSortParamSchema = vouchListSortSchema.optional()
export const dashboardSortSchema = vouchListSortSchema

export const dashboardSearchParamsSchema = z.object({
  status: sanitizedDashboardStatusParamSchema,
  page: z.coerce.number().int().min(1).optional(),
  sort: sanitizedDashboardSortParamSchema,
})

export const dashboardSectionStateSchema = z.object({
  id: dashboardSectionIdSchema,
  title: z.string().min(1).max(120),
  count: z.number().int().nonnegative(),
  collapsed: z.boolean().optional(),
})
