// types/dashboardTypes.ts

import type { VouchCardDTO } from "@/lib/dto/vouch.mappers"
import type { VouchListSort } from "./vouchTypes"

export type DashboardSectionKey =
  | "drafts"
  | "actionRequired"
  | "active"
  | "completed"
  | "expired"
  | "archived"

export type DashboardStatusFilter = "all" | DashboardSectionKey

export type DashboardVariant = "empty" | "mixed_vouch_states"

export type DashboardFiltersDTO = {
  status: DashboardStatusFilter
  page: number
  sort: VouchListSort
}

export type DashboardCounts = Record<DashboardSectionKey, number>

export type DashboardSections = Record<DashboardSectionKey, VouchCardDTO[]>

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

export type DashboardSearchParams = {
  status?: DashboardStatusFilter
  page?: number
  sort?: VouchListSort
}

export type DashboardSectionState = {
  id: DashboardSectionKey
  title: string
  count: number
  collapsed?: boolean
}

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

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
