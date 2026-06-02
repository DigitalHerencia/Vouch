import "server-only"

import { mapVouchCardDTO, type VouchCardDTO } from "./vouch.mappers"

type DashboardVouchRecord = Parameters<typeof mapVouchCardDTO>[0]

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

export function mapDashboardVouchCards(records: DashboardVouchRecord[]): VouchCardDTO[] {
  return records.map(mapVouchCardDTO)
}

export function mapDashboardSummaryDTO(input: {
  userId: string
  drafts: DashboardVouchRecord[]
  actionRequired: DashboardVouchRecord[]
  active: DashboardVouchRecord[]
  completed: DashboardVouchRecord[]
  expired: DashboardVouchRecord[]
  archived: DashboardVouchRecord[]
}): DashboardSummaryDTO {
  const drafts = mapDashboardVouchCards(input.drafts)
  const actionRequired = mapDashboardVouchCards(input.actionRequired)
  const active = mapDashboardVouchCards(input.active)
  const completed = mapDashboardVouchCards(input.completed)
  const expired = mapDashboardVouchCards(input.expired)
  const archived = mapDashboardVouchCards(input.archived)

  return {
    userId: input.userId,
    counts: {
      drafts: drafts.length,
      actionRequired: actionRequired.length,
      active: active.length,
      completed: completed.length,
      expired: expired.length,
      archived: archived.length,
    },
    sections: {
      drafts,
      actionRequired,
      active,
      completed,
      expired,
      archived,
    },
  }
}

export function getDashboardVariant(
  summary: DashboardSummaryDTO | null
): DashboardPageStateDTO["variant"] {
  if (!summary) return "empty"
  return Object.values(summary.counts).some((count) => count > 0) ? "mixed_vouch_states" : "empty"
}
