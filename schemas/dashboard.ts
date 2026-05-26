import { z } from "zod"
import { vouchListSortSchema } from "./vouch"

export const dashboardSectionIdSchema = z.enum([
  "action_required",
  "active",
  "completed",
  "expired",
  "archived",
])

export const dashboardVariantSchema = z.enum([
  "empty",
  "action_required",
  "active_vouches",
  "mixed_vouch_states",
  "merchant_focused",
  "customer_focused",
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

export const dashboardPreferencesSchema = z.object({
  status: dashboardSectionIdSchema.optional(),
  sort: vouchListSortSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const dashboardSectionStateSchema = z.object({
  id: dashboardSectionIdSchema,
  title: z.string().min(1).max(120),
  count: z.number().int().nonnegative(),
  collapsed: z.boolean().optional(),
})
