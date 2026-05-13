import "server-only"

import type { ISODateTime } from "@/types/common"

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
    actionRequired: number
    active: number
    completed: number
    expired: number
    archived: number
  }
  sections: {
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

export function mapDashboardVouchCards(records: DashboardVouchRecord[]): VouchCardDTO[] {
  return records.map(mapVouchCardDTO)
}

export function mapDashboardSummaryDTO(input: {
  userId: string
  actionRequired: DashboardVouchRecord[]
  active: DashboardVouchRecord[]
  completed: DashboardVouchRecord[]
  expired: DashboardVouchRecord[]
  archived: DashboardVouchRecord[]
}): DashboardSummaryDTO {
  const actionRequired = mapDashboardVouchCards(input.actionRequired)
  const active = mapDashboardVouchCards(input.active)
  const completed = mapDashboardVouchCards(input.completed)
  const expired = mapDashboardVouchCards(input.expired)
  const archived = mapDashboardVouchCards(input.archived)

  return {
    userId: input.userId,
    counts: {
      actionRequired: actionRequired.length,
      active: active.length,
      completed: completed.length,
      expired: expired.length,
      archived: archived.length,
    },
    sections: {
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

export function mapDashboardReadinessCalloutDTO(input: {
  canCreateVouch: boolean
  needsPayment: boolean
  needsPayout: boolean
  needsTerms: boolean
  needsVerification: boolean
}): DashboardReadinessCalloutDTO {
  if (input.canCreateVouch) {
    return {
      visible: false,
      title: "Ready",
      body: "Account readiness is complete.",
      actions: [],
    }
  }

  const actions: DashboardReadinessCalloutDTO["actions"] = []

  if (input.needsPayment) {
    actions.push({
      id: "payment",
      label: "Manage payment",
      kind: "payment",
    })
  }

  if (input.needsPayout) {
    actions.push({
      id: "connect",
      label: "Connect Stripe",
      kind: "connect",
    })
  }

  return {
    visible: true,
    title: "Required account step",
    body: "Complete the required provider-backed readiness steps before creating or accepting a Vouch.",
    actions: actions.length
      ? actions
      : [
          {
            id: "none",
            label: "Review readiness",
            kind: "none",
          },
        ],
  }
}
