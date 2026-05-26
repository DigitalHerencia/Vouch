import type { VouchListSort } from "./vouch"

export type DashboardSectionID =
  | "action_required"
  | "active"
  | "completed"
  | "expired"
  | "archived"

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
