import type { z } from "zod"
import type {
  dashboardSearchParamsSchema,
  dashboardSectionIdSchema,
  dashboardSectionStateSchema,
  dashboardVariantSchema,
} from "@/schemas/dashboard"

export type DashboardSectionID = z.infer<typeof dashboardSectionIdSchema>
export type DashboardVariant = z.infer<typeof dashboardVariantSchema>
export type DashboardSearchParams = z.infer<typeof dashboardSearchParamsSchema>
export type DashboardSectionState = z.infer<typeof dashboardSectionStateSchema>