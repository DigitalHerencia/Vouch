import "server-only"

import type { AuditTimelineItemDTO } from "@/lib/dto/audit.mappers"
import type { VouchDetailDTO } from "@/lib/dto/vouch.mappers"
import type {
  ParticipantRole,
  VouchDetailDisplayDTO,
  VouchStatusDocumentData,
  VouchStatusTimelineItem,
  VouchStatusTone,
} from "@/types/vouchTypes"

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDateTime(value: string | null | undefined): string {
  return value ? dateTimeFormatter.format(new Date(value)) : "Not set"
}

function labelize(value: string | null | undefined): string {
  return value ? value.replaceAll("_", " ").toUpperCase() : "PENDING"
}

function participantName(participant: VouchDetailDTO["merchant"] | VouchDetailDTO["customer"]) {
  return participant?.displayName ?? participant?.email ?? "Pending"
}

function roleLabel(role: ParticipantRole | null): string {
  if (role === "merchant") return "Merchant"
  if (role === "customer") return "Customer"
  return "Participant"
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

function buildTimeline(input: {
  vouch: VouchDetailDTO
  merchantConfirmed: boolean
  customerConfirmed: boolean
  auditTimeline: AuditTimelineItemDTO[]
}): VouchStatusTimelineItem[] {
  const bothConfirmed = input.merchantConfirmed && input.customerConfirmed
  const firstAuditAt = input.auditTimeline[0]?.createdAt ?? input.vouch.createdAt

  return [
    {
      id: "created",
      title: "Created",
      description: "The Vouch was created and the terms are now visible to both participants.",
      timeLabel: formatDateTime(firstAuditAt),
      state: "completed",
      meta: labelize(input.vouch.status),
    },
    {
      id: "payment",
      title: "Payment authorization",
      description: "The customer authorizes the payment through the hosted provider flow.",
      timeLabel: formatDateTime(input.vouch.authorizedAt ?? input.vouch.appointmentAt),
      state: input.vouch.paymentRecord?.status === "not_started" ? "upcoming" : "completed",
      meta: labelize(input.vouch.paymentRecord?.status ?? "not_started"),
    },
    {
      id: "confirmation",
      title: "Presence confirmation",
      description: "Merchant and customer both need to confirm before the window closes.",
      timeLabel: formatDateTime(input.vouch.confirmationExpiresAt),
      state: bothConfirmed
        ? "completed"
        : input.vouch.windowState === "open"
          ? "current"
          : "upcoming",
      meta: bothConfirmed ? "BOTH CONFIRMED" : "WAITING",
    },
    {
      id: "outcome",
      title: "Outcome",
      description: bothConfirmed
        ? "Both confirmations are present, so the Vouch can move to the final payment outcome."
        : "If both confirmations are not present, funds are not released by Vouch.",
      timeLabel: formatDateTime(input.vouch.confirmationExpiresAt),
      state: bothConfirmed ? "current" : "upcoming",
      meta: labelize(input.vouch.paymentRecord?.status ?? "pending"),
    },
  ]
}

export function mapVouchDetailDisplayDTO(input: {
  vouch: VouchDetailDTO
  role: ParticipantRole | null
  canConfirm: boolean
  currentUserCode?: string
  authorizationCheckoutUrl: string | null
  auditTimeline: AuditTimelineItemDTO[]
}): VouchDetailDisplayDTO {
  const merchantConfirmed =
    input.vouch.aggregateConfirmationStatus === "merchant_confirmed" ||
    input.vouch.aggregateConfirmationStatus === "both_confirmed"

  const customerConfirmed =
    input.vouch.aggregateConfirmationStatus === "customer_confirmed" ||
    input.vouch.aggregateConfirmationStatus === "both_confirmed"

  const amountLabel = formatMoney(input.vouch.amountCents, input.vouch.currency)
  const customerTotalLabel = formatMoney(
    input.vouch.paymentRecord?.amountCents ?? input.vouch.amountCents,
    input.vouch.currency
  )
  const appointmentLabel = formatDateTime(input.vouch.appointmentAt)
  const opensLabel = formatDateTime(input.vouch.confirmationOpensAt)
  const expiresLabel = formatDateTime(input.vouch.confirmationExpiresAt)
  const paymentStatusLabel = labelize(input.vouch.paymentRecord?.status ?? "not_started")
  const settlementStatusLabel = labelize(input.vouch.paymentRecord?.status ?? "pending")
  const currentRoleLabel = roleLabel(input.role)

  const document: VouchStatusDocumentData = {
    title: "Vouch summary",
    publicId: input.vouch.publicId,
    status: labelize(input.vouch.status),
    statusTone: statusTone(input.vouch.status),
    amountLabel,
    merchantReceivesLabel: amountLabel,
    customerTotalLabel,
    merchantLabel: participantName(input.vouch.merchant),
    customerLabel: participantName(input.vouch.customer),
    appointmentLabel,
    confirmationOpensLabel: opensLabel,
    confirmationExpiresLabel: expiresLabel,
    paymentStatusLabel,
    settlementStatusLabel,
    countdown: {
      label: "Window",
      expiresAtLabel: expiresLabel,
      remainingLabel: input.vouch.windowState === "closed" ? "Closed" : "Open",
      ...(input.vouch.confirmationOpensAt ? { startsAt: input.vouch.confirmationOpensAt } : {}),
      ...(input.vouch.confirmationExpiresAt
        ? { expiresAt: input.vouch.confirmationExpiresAt }
        : {}),
      percentRemaining: windowProgress(
        input.vouch.confirmationOpensAt,
        input.vouch.confirmationExpiresAt
      ),
      tone:
        merchantConfirmed && customerConfirmed
          ? "complete"
          : input.vouch.windowState === "closed"
            ? "expired"
            : "active",
    },
    confirmations: {
      merchantConfirmed,
      customerConfirmed,
    },
    timeline: buildTimeline({
      vouch: input.vouch,
      merchantConfirmed,
      customerConfirmed,
      auditTimeline: input.auditTimeline,
    }),
  }

  return {
    pageTitle: {
      eyebrow: "Vouch detail",
      title: "Vouch details",
      description: `${input.vouch.publicId} · ${currentRoleLabel} · ${appointmentLabel}`,
    },
    document,
    refreshWindow:
      input.vouch.confirmationOpensAt && input.vouch.confirmationExpiresAt
        ? {
            confirmationOpensAt: input.vouch.confirmationOpensAt,
            confirmationExpiresAt: input.vouch.confirmationExpiresAt,
          }
        : null,
    confirmationAction: {
      canConfirm: input.canConfirm,
      confirmationExpiresAt: input.vouch.confirmationExpiresAt,
      authorizationCheckoutUrl: input.authorizationCheckoutUrl,
      ...(input.currentUserCode ? { currentUserCode: input.currentUserCode } : {}),
    },
  }
}
