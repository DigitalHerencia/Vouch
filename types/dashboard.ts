import type { VouchListSort } from "./vouch"

export type DashboardSectionID =
  | "action_required"
  | "active"
  | "pending"
  | "completed"
  | "expired_refunded"

export type DashboardVariant =
  | "empty"
  | "action_required"
  | "active_vouches"
  | "mixed_vouch_states"
  | "payer_focused"
  | "payee_focused"
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
