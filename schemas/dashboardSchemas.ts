// schemas/dashboardSchemas.ts

import { z } from "zod"

import { VOUCH_LIST_SORT_VALUES } from "@/lib/vouch/constants"
import type { DashboardFiltersDTO } from "@/types/dashboardTypes"

export const DASHBOARD_STATUS_FILTER_VALUES = [
  "all",
  "drafts",
  "actionRequired",
  "active",
  "completed",
  "expired",
  "archived",
] as const

export const dashboardStatusFilterSchema = z.enum(DASHBOARD_STATUS_FILTER_VALUES)

export const dashboardSearchParamsSchema = z.object({
  status: dashboardStatusFilterSchema.catch("all").default("all"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  sort: z.enum(VOUCH_LIST_SORT_VALUES).catch("newest").default("newest"),
})

export type DashboardSearchParamsInput = Record<string, string | string[] | undefined>

function firstSearchParamValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseDashboardSearchParams(
  searchParams: DashboardSearchParamsInput = {}
): DashboardFiltersDTO {
  return dashboardSearchParamsSchema.parse({
    status: firstSearchParamValue(searchParams.status),
    page: firstSearchParamValue(searchParams.page),
    sort: firstSearchParamValue(searchParams.sort),
  })
}
