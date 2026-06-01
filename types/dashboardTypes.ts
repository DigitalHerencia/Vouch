import type { ISODateTime } from "./commonTypes"
import type { VouchCardDTO, VouchListSort } from "./vouchTypes"

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

export type DashboardFiltersDTO = {
  status: string
  page: number
  sort: string
}

export type DashboardSummaryDTO = {
  userId: string
  counts: {
    drafts: number
    actionRequired: number
    active: number
    completed: number
    expired: number
    archived: number
  }
  sections: {
    drafts: VouchCardDTO[]
    actionRequired: VouchCardDTO[]
    active: VouchCardDTO[]
    completed: VouchCardDTO[]
    expired: VouchCardDTO[]
    archived: VouchCardDTO[]
  }
}

export type DashboardPageStateDTO = {
  variant: "empty" | "mixed_vouch_states"
  filters: DashboardFiltersDTO
  summary: DashboardSummaryDTO | null
}

export type DashboardReadinessCalloutDTO = {
  visible: boolean
  title: string
  body: string
  actions: Array<{
    id: string
    label: string
    kind: "connect" | "payment" | "none"
  }>
}

export type DashboardEmptyStateDTO = {
  userId: string
  title: string
  message: string
  cta: {
    label: string
    href: string
  }
}

export type DashboardRecentActivityDTO = {
  id: string
  label: string
  body: string
  occurredAt: ISODateTime
}
