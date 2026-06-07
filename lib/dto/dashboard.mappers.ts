// lib/dto/dashboard.mappers.ts

import "server-only"

import { mapVouchCardDTO, type VouchCardDTO } from "./vouch.mappers"
import type { StatsCards } from "@/components/shared/stats-cards"
import type { InvoiceSummary } from "@/components/dashboard/invoice-summary"
import { formatDate } from "date-fns"
import type { ComponentProps } from "react"
import {
  formatCurrency,
  formatDateTime,
  formatParticipantName,
  getPercentRemaining,
  getRemainingLabel,
  getStatusLabel,
  mapStatusTone,
} from "../utils/dashboardUtils"
import type { InvoiceSummaryData } from "@/types/dashboardTypes"

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
  warnings: {
    paymentMethodRequired: boolean
  }
}

export function mapDashboardVouchCards(records: DashboardVouchRecord[]): VouchCardDTO[] {
  return records.map(mapVouchCardDTO)
}

export function mapDashboardSummaryDTO(input: {
  userId: string
  counts: DashboardSummaryDTO["counts"]
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
    counts: input.counts,
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

export function mapVouchToInvoice(vouch: VouchCardDTO): InvoiceSummaryData {
  const tone = mapStatusTone(vouch.status)
  const deadline = vouch.confirmationExpiresAt ?? vouch.appointmentAt

  return {
    invoiceNumber: vouch.publicId,
    clientName: formatParticipantName(vouch),
    issueDate: formatDateTime(vouch.createdAt),
    dueDate: formatDateTime(deadline),
    amount: vouch.amountCents / 100,
    amountLabel: formatCurrency(vouch.amountCents, vouch.currency),
    status: getStatusLabel(vouch.status),
    statusTone: tone,
    href: `/vouches/${vouch.id}`,
    vouchId: vouch.id,
    appointmentLabel: formatDateTime(vouch.appointmentAt),
    confirmationWindowLabel: `${formatDateTime(vouch.confirmationOpensAt)} to ${formatDateTime(
      vouch.confirmationExpiresAt
    )}`,
    protectedAmountLabel: formatCurrency(vouch.amountCents, vouch.currency),
    label: "Confirmation deadline",
    expiresAtLabel: formatDateTime(deadline),
    remainingLabel: getRemainingLabel(deadline),
    percentRemaining: getPercentRemaining(vouch),
    tone,
  }
}
