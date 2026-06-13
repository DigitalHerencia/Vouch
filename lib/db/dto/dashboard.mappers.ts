// lib/dto/dashboard.mappers.ts

import "server-only"

import { mapVouchCardDTO, type VouchCardDTO } from "@/lib/db/dto/vouch.mappers"
import {
  formatCurrency,
  formatDateTime,
  formatParticipantName,
  getPercentRemaining,
  mapStatusTone,
} from "@/lib/utils/dashboardUtils"
import type {
  DashboardPageStateDTO,
  DashboardSummaryDTO,
  InvoiceSummaryData,
  VouchArchiveListItem,
} from "@/types/dashboardTypes"

type DashboardVouchRecord = Parameters<typeof mapVouchCardDTO>[0]

function getTimelineCopy(vouch: VouchCardDTO): {
  label: string
  remainingLabel: string
} {
  if (vouch.status === "draft") {
    return {
      label: "Next step",
      remainingLabel: "Awaiting setup",
    }
  }

  if (vouch.status === "protocol_fee_paid" || vouch.status === "authorized") {
    return {
      label: "Confirmation timeline",
      remainingLabel: "Scheduled",
    }
  }

  if (vouch.status === "can_capture") {
    return {
      label: "Confirmation window",
      remainingLabel: "Open now",
    }
  }

  if (vouch.status === "captured") {
    return {
      label: "Outcome",
      remainingLabel: "Completed",
    }
  }

  if (vouch.status === "expired") {
    return {
      label: "Outcome",
      remainingLabel: "Window closed",
    }
  }

  if (vouch.status === "archived") {
    return {
      label: "Archive status",
      remainingLabel: "Archived",
    }
  }

  return {
    label: "Timeline",
    remainingLabel: "Review status",
  }
}

function formatWindowLabel(input: { opensAt: string | null; expiresAt: string | null }): string {
  if (!input.opensAt || !input.expiresAt) return "Window unavailable"

  const startsAt = formatDateTime(input.opensAt)
  const endsAt = formatDateTime(input.expiresAt)

  const startTime = startsAt.replace(/^[A-Z][a-z]{2}\s+\d{1,2},\s+/, "")
  const endTime = endsAt.replace(/^[A-Z][a-z]{2}\s+\d{1,2},\s+/, "")

  return `${startTime} – ${endTime}`
}

function mapDashboardVouchCards(records: DashboardVouchRecord[]): VouchCardDTO[] {
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
  return {
    userId: input.userId,
    counts: input.counts,
    sections: {
      drafts: mapDashboardVouchCards(input.drafts),
      actionRequired: mapDashboardVouchCards(input.actionRequired),
      active: mapDashboardVouchCards(input.active),
      completed: mapDashboardVouchCards(input.completed),
      expired: mapDashboardVouchCards(input.expired),
      archived: mapDashboardVouchCards(input.archived),
    },
  }
}

export function getDashboardVariant(
  summary: DashboardSummaryDTO | null
): DashboardPageStateDTO["variant"] {
  if (!summary) return "empty"

  const visibleCount =
    summary.counts.drafts +
    summary.counts.actionRequired +
    summary.counts.active +
    summary.counts.completed +
    summary.counts.expired

  return visibleCount > 0 ? "mixed_vouch_states" : "empty"
}

export function mapVouchToInvoice(vouch: VouchCardDTO): InvoiceSummaryData {
  const tone = mapStatusTone(vouch.status)
  const deadline = vouch.confirmationExpiresAt ?? vouch.appointmentAt
  const timeline = getTimelineCopy(vouch)

  return {
    invoiceNumber: vouch.publicId,
    clientName: formatParticipantName(vouch),
    amount: vouch.amountCents / 100,
    amountLabel: formatCurrency(vouch.amountCents, vouch.currency),
    href: `/vouches/${vouch.id}`,
    vouchId: vouch.id,
    protectedAmountLabel: formatCurrency(vouch.amountCents, vouch.currency),
    label: timeline.label,
    expiresAtLabel: formatDateTime(deadline),
    remainingLabel: timeline.remainingLabel,
    windowLabel: formatWindowLabel({
      opensAt: vouch.confirmationOpensAt,
      expiresAt: vouch.confirmationExpiresAt,
    }),
    percentRemaining: getPercentRemaining(vouch),
    tone,
  }
}

export function mapVouchToArchiveListItem(vouch: VouchCardDTO): VouchArchiveListItem {
  return {
    id: vouch.id,
    publicId: vouch.publicId,
    participantName: formatParticipantName(vouch),
    appointmentLabel: formatDateTime(vouch.appointmentAt),
    amountLabel: formatCurrency(vouch.amountCents, vouch.currency),
    statusLabel: vouch.status.replaceAll("_", " "),
    tone: mapStatusTone(vouch.status),
    href: `/vouches/${vouch.id}`,
  }
}
