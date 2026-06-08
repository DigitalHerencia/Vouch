import "server-only"

import type { AuditTimelineItemDTO } from "@/lib/dto/audit.mappers"
import type { VouchDetailDTO } from "@/lib/dto/vouch.mappers"
import { vouchPageCopy } from "@/content/vouches"
import type { ParticipantRole, VouchDetailDisplayDTO, VouchStatusDocumentData, VouchStatusTimelineItem, VouchStatusTone } from "@/types/vouchTypes"

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" })

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100)
}

function formatDateTime(value: string | null | undefined): string {
  return value ? dateTimeFormatter.format(new Date(value)) : "Not set"
}

function labelize(value: string | null | undefined): string {
  return value ? value.replaceAll("_", " ").toUpperCase() : "PENDING"
}

function participantName(participant: VouchDetailDTO["merchant"] | VouchDetailDTO["customer"]): string {
  return participant?.displayName ?? participant?.email ?? "Pending"
}

function statusTone(status: string): VouchStatusTone {
  const normalized = status.toLowerCase()
  if (normalized.includes("expired") || normalized.includes("void")) return "expired"
  if (normalized.includes("fail") || normalized.includes("refund")) return "failed"
  if (normalized.includes("complete") || normalized.includes("captured")) return "complete"
  if (normalized.includes("pending") || normalized.includes("draft")) return "pending"
  return "active"
}

function windowProgress(opens: string | null, expires: string | null): number {
  if (!opens || !expires) return 0
  const now = Date.now()
  const opensAt = new Date(opens).getTime()
  const expiresAt = new Date(expires).getTime()
  if (!opensAt || !expiresAt || expiresAt <= opensAt) return 0
  if (now <= opensAt) return 100
  if (now >= expiresAt) return 0
  return ((expiresAt - now) / (expiresAt - opensAt)) * 100
}

function detailTimeline(input: { vouch: VouchDetailDTO; merchantConfirmed: boolean; customerConfirmed: boolean; auditTimeline: AuditTimelineItemDTO[] }): VouchStatusTimelineItem[] {
  const bothConfirmed = input.merchantConfirmed && input.customerConfirmed
  return [
    {
      id: "created",
      title: "Vouch created",
      description: "The record is open and participant-scoped.",
      timeLabel: formatDateTime(input.auditTimeline[0]?.createdAt ?? input.vouch.createdAt),
      state: "completed",
      meta: labelize(input.vouch.status),
    },
    {
      id: "customer-step",
      title: "Customer step",
      description: "The customer completes the hosted setup step.",
      timeLabel: formatDateTime(input.vouch.authorizedAt ?? input.vouch.appointmentAt),
      state: input.vouch.paymentRecord?.status === "not_started" ? "upcoming" : "completed",
      meta: labelize(input.vouch.paymentRecord?.status ?? "not_started"),
    },
    {
      id: "window",
      title: "Confirmation window",
      description: "Both participants confirm presence before the deadline.",
      timeLabel: formatDateTime(input.vouch.confirmationExpiresAt),
      state: bothConfirmed ? "completed" : input.vouch.windowState === "open" ? "current" : "upcoming",
      meta: `EXPIRES ${formatDateTime(input.vouch.confirmationExpiresAt)}`,
    },
    {
      id: "merchant",
      title: "Merchant presence",
      description: "Merchant confirmation state.",
      state: input.merchantConfirmed ? "completed" : "upcoming",
      meta: input.merchantConfirmed ? "CONFIRMED" : "WAITING",
    },
    {
      id: "customer",
      title: "Customer presence",
      description: "Customer confirmation state.",
      state: input.customerConfirmed ? "completed" : "upcoming",
      meta: input.customerConfirmed ? "CONFIRMED" : "WAITING",
    },
    {
      id: "outcome",
      title: "Final outcome",
      description: bothConfirmed ? "Both confirmations are present." : "Both confirmations are still required.",
      timeLabel: formatDateTime(input.vouch.confirmationExpiresAt),
      state: bothConfirmed ? "current" : "upcoming",
      meta: labelize(input.vouch.paymentRecord?.status ?? "pending"),
    },
  ]
}

export function mapVouchDetailDisplayDTO(input: { vouch: VouchDetailDTO; role: ParticipantRole | null; canConfirm: boolean; currentUserCode?: string; authorizationCheckoutUrl: string | null; auditTimeline: AuditTimelineItemDTO[] }): VouchDetailDisplayDTO {
  const copy = vouchPageCopy.detail
  const merchantConfirmed = input.vouch.aggregateConfirmationStatus === "merchant_confirmed" || input.vouch.aggregateConfirmationStatus === "both_confirmed"
  const customerConfirmed = input.vouch.aggregateConfirmationStatus === "customer_confirmed" || input.vouch.aggregateConfirmationStatus === "both_confirmed"
  const amountLabel = formatMoney(input.vouch.amountCents, input.vouch.currency)
  const appointmentLabel = formatDateTime(input.vouch.appointmentAt)
  const opensLabel = formatDateTime(input.vouch.confirmationOpensAt)
  const expiresLabel = formatDateTime(input.vouch.confirmationExpiresAt)
  const paymentStatusLabel = labelize(input.vouch.paymentRecord?.status ?? "not_started")
  const settlementStatusLabel = labelize(input.vouch.paymentRecord?.status ?? "pending")
  const countdownTone: VouchStatusTone = merchantConfirmed && customerConfirmed ? "complete" : input.vouch.windowState === "closed" ? "expired" : "active"
  const document: VouchStatusDocumentData = {
    title: copy.termsTitle,
    publicId: input.vouch.publicId,
    status: labelize(input.vouch.status),
    statusTone: statusTone(input.vouch.status),
    amountLabel,
    merchantReceivesLabel: amountLabel,
    customerTotalLabel: formatMoney(input.vouch.paymentRecord?.amountCents ?? input.vouch.amountCents, input.vouch.currency),
    merchantLabel: participantName(input.vouch.merchant),
    customerLabel: participantName(input.vouch.customer),
    appointmentLabel,
    confirmationOpensLabel: opensLabel,
    confirmationExpiresLabel: expiresLabel,
    paymentStatusLabel,
    settlementStatusLabel,
    countdown: {
      label: "Confirmation window",
      expiresAtLabel: expiresLabel,
      remainingLabel: input.vouch.windowState === "closed" ? "Window closed" : "Server timed",
      ...(input.vouch.confirmationOpensAt ? { startsAt: input.vouch.confirmationOpensAt } : {}),
      ...(input.vouch.confirmationExpiresAt ? { expiresAt: input.vouch.confirmationExpiresAt } : {}),
      percentRemaining: windowProgress(input.vouch.confirmationOpensAt, input.vouch.confirmationExpiresAt),
      tone: countdownTone,
    },
    confirmations: { merchantConfirmed, customerConfirmed },
    timeline: detailTimeline({ vouch: input.vouch, merchantConfirmed, customerConfirmed, auditTimeline: input.auditTimeline }),
    audit: [
      { label: copy.labels.appointment, value: appointmentLabel },
      { label: copy.labels.opens, value: opensLabel },
      { label: copy.labels.expires, value: expiresLabel },
      { label: copy.labels.role, value: input.role ?? "participant" },
      { label: copy.sections.payment, value: paymentStatusLabel },
      { label: copy.sections.rule, value: copy.oneSidedRule },
    ],
  }
  return {
    pageTitle: { eyebrow: copy.eyebrow, title: `${copy.title} ${input.vouch.publicId}`, description: copy.heroBody.replace("{appointmentLabel}", appointmentLabel) },
    document,
    refreshWindow: input.vouch.confirmationOpensAt && input.vouch.confirmationExpiresAt ? { confirmationOpensAt: input.vouch.confirmationOpensAt, confirmationExpiresAt: input.vouch.confirmationExpiresAt } : null,
    confirmationAction: {
      canConfirm: input.canConfirm,
      confirmationExpiresAt: input.vouch.confirmationExpiresAt,
      authorizationCheckoutUrl: input.authorizationCheckoutUrl,
      ...(input.currentUserCode ? { currentUserCode: input.currentUserCode } : {}),
    },
  }
}
