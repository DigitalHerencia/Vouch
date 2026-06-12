// types/dashboardTypes.ts

import type { VouchCardDTO } from "@/lib/db/dto/vouch.mappers"
import type { VouchListSort, VouchStatusTone } from "./vouchTypes"

type DashboardStatusFilter = "all" | DashboardSectionKey
type DashboardVariant = "empty" | "mixed_vouch_states"
type DashboardCounts = Record<DashboardSectionKey, number>
type DashboardSections = Record<DashboardSectionKey, VouchCardDTO[]>

export type DashboardSectionKey =
  | "drafts"
  | "actionRequired"
  | "active"
  | "completed"
  | "expired"
  | "archived"

export type DashboardFiltersDTO = {
  status: DashboardStatusFilter
  page: number
  sort: VouchListSort
}

export type DashboardSummaryDTO = {
  userId: string
  counts: DashboardCounts
  sections: DashboardSections
}

export type DashboardPageStateDTO = {
  variant: DashboardVariant
  filters: DashboardFiltersDTO
  summary: DashboardSummaryDTO | null
}

export type DashboardStatItem = {
  label: string
  value: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export type InvoiceSummaryData = {
  invoiceNumber: string
  clientName: string
  amount: number
  amountLabel?: string
  href: string
  vouchId?: string
  protectedAmountLabel?: string
  label: string
  expiresAtLabel: string
  remainingLabel: string
  windowLabel: string
  percentRemaining: number
  tone: VouchStatusTone
  disabled?: boolean
}
