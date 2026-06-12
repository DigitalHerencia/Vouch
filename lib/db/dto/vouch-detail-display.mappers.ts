import "server-only"

import type { AuditTimelineItemDTO } from "@/lib/db/dto/audit.mappers"
import type { VouchDetailDTO } from "@/lib/db/dto/vouch.mappers"
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

function paymentLabel(value: string | null | undefined): string {
  switch (value) {
    case "requires_payment_method":
      return "CHECKOUT OPEN"
    case "requires_confirmation":
    case "requires_action":
      return "ACTION NEEDED"
    case "processing":
      return "PROCESSING"
    case "requires_capture":
      return "AUTHORIZED"
    case "succeeded":
      return "CAPTURED"
    case "canceled":
      return "CANCELED"
    case "not_started":
    case undefined:
    case null:
      return "NOT STARTED"
    default:
      return labelize(value)
  }
}

function settlementLabel(input: {
  vouchStatus: string
  paymentStatus: string | null | undefined
  capturedAt: string | null
  voidedAt: string | null
  expiredAt: string | null
  bothConfirmed: boolean
}): string {
  if (input.capturedAt) return "RELEASED"
  if (input.voidedAt || input.expiredAt || input.paymentStatus === "canceled") return "NOT RELEASED"
  if (
    input.vouchStatus === "can_capture" &&
    input.paymentStatus === "requires_capture" &&
    input.bothConfirmed
  ) {
    return "CAPTURE PENDING"
  }
  if (input.paymentStatus === "requires_capture") return "PENDING CONFIRMATION"
  if (input.paymentStatus === "requires_payment_method") return "WAITING ON CUSTOMER"

  return "PENDING"
}

function participantName(
  participant: VouchDetailDTO["merchant"] | VouchDetailDTO["customer"],
  fallback: string
) {
  return participant?.displayName ?? fallback
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
  role: ParticipantRole | null
  merchantConfirmed: boolean
  customerConfirmed: boolean
  auditTimeline: AuditTimelineItemDTO[]
}): VouchStatusTimelineItem[] {
  const bothConfirmed = input.merchantConfirmed && input.customerConfirmed
  const firstAuditAt = input.auditTimeline[0]?.createdAt ?? input.vouch.createdAt
  const paymentStatus = input.vouch.paymentRecord?.status ?? "not_started"
  const paymentAuthorized =
    Boolean(input.vouch.authorizedAt) ||
    paymentStatus === "requires_capture" ||
    paymentStatus === "succeeded"

  const paymentStarted =
    Boolean(input.vouch.protocolFeePaidAt) || Boolean(input.vouch.paymentRecord?.checkoutUrl)
  const paymentDescription =
    input.role === "merchant"
      ? "Send the Stripe authorization link to the customer."
      : input.role === "customer"
        ? "Authorize the protected amount through Stripe before the appointment."
        : "Customer authorization must complete before the appointment."
  const capturePending =
    input.vouch.status === "can_capture" && paymentStatus === "requires_capture" && bothConfirmed

  return [
    {
      id: "created",
      title: "Created",
      description: "Vouch is visible to both participants.",
      timeLabel: formatDateTime(firstAuditAt),
      state: "completed",
      meta: "VISIBLE",
    },
    {
      id: "payment",
      title: "Payment",
      description: paymentDescription,
      timeLabel: formatDateTime(input.vouch.authorizedAt ?? input.vouch.appointmentAt),
      state: paymentAuthorized ? "completed" : paymentStarted ? "current" : "upcoming",
      meta: paymentLabel(paymentStatus),
    },
    {
      id: "confirmation",
      title: "Confirmation",
      description: "Both participants exchange confirmation codes inside the window.",
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
      description: "Release happens only after authorization and confirmation are complete.",
      timeLabel: formatDateTime(input.vouch.confirmationExpiresAt),
      state: input.vouch.capturedAt ? "completed" : bothConfirmed ? "current" : "upcoming",
      meta: input.vouch.capturedAt ? "RELEASED" : capturePending ? "CAPTURE PENDING" : "PENDING",
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

  const bothConfirmed = merchantConfirmed && customerConfirmed
  const amountLabel = formatMoney(input.vouch.amountCents, input.vouch.currency)
  const customerTotalLabel = formatMoney(
    input.vouch.paymentRecord?.amountCents ?? input.vouch.amountCents,
    input.vouch.currency
  )
  const appointmentLabel = formatDateTime(input.vouch.appointmentAt)
  const opensLabel = formatDateTime(input.vouch.confirmationOpensAt)
  const expiresLabel = formatDateTime(input.vouch.confirmationExpiresAt)
  const rawPaymentStatus = input.vouch.paymentRecord?.status ?? "not_started"
  const paymentStatusLabel = paymentLabel(rawPaymentStatus)
  const settlementStatusLabel = settlementLabel({
    vouchStatus: input.vouch.status,
    paymentStatus: rawPaymentStatus,
    capturedAt: input.vouch.capturedAt,
    voidedAt: input.vouch.voidedAt,
    expiredAt: input.vouch.expiredAt,
    bothConfirmed,
  })
  const currentRoleLabel = roleLabel(input.role)
  const authorizationCheckoutUrl =
    input.role === "merchant"
      ? (input.authorizationCheckoutUrl ?? input.vouch.paymentRecord?.checkoutUrl ?? null)
      : null

  const document: VouchStatusDocumentData = {
    title: "Live Vouch",
    publicId: input.vouch.publicId,
    status: labelize(input.vouch.status),
    statusTone: statusTone(input.vouch.status),
    amountLabel,
    merchantReceivesLabel: amountLabel,
    customerTotalLabel,
    authorizationCheckoutUrl,
    merchantLabel: participantName(input.vouch.merchant, "Merchant"),
    customerLabel: participantName(input.vouch.customer, "Awaiting customer"),
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
      role: input.role,
      merchantConfirmed,
      customerConfirmed,
      auditTimeline: input.auditTimeline,
    }),
  }

  return {
    pageTitle: {
      eyebrow: "Vouch detail",
      title: "Live Vouch",
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
      authorizationCheckoutUrl,
      ...(input.currentUserCode ? { currentUserCode: input.currentUserCode } : {}),
    },
  }
}
