// types/dashboardTypes.ts

import type { StatsCards } from "@/components/shared/stats-cards"
import type { InvoiceSummary } from "@/components/dashboard/invoice-summary"
import type { ComponentProps } from "react"
import type { VouchListSort } from "./vouchTypes"

export type InvoiceSummaryData = ComponentProps<typeof InvoiceSummary>
export type StatItem = ComponentProps<typeof StatsCards>["stats"][number]
export type VouchStatusTone = NonNullable<InvoiceSummaryData["tone"]>

export type DashboardSectionID = "action_required" | "active" | "completed" | "expired" | "archived"

export type DashboardVariant =
  | "empty"
  | "action_required"
  | "active_vouches"
  | "mixed_vouch_states"
  | "merchant_focused"
  | "customer_focused"
  | "loading"
  | "error"

export interface DashboardSearchParams {
  status?: DashboardSectionID | "all"
  page?: number
  sort?: VouchListSort
}

export interface DashboardSectionState {
  id: DashboardSectionID
  title: string
  count: number
  collapsed?: boolean
}
