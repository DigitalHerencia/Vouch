import type { ComponentProps } from "react"

import { HeroCentered } from "@/components/shared/hero-centered"
import { StatsCards } from "@/components/shared/stats-cards"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { DashboardRequirementsNotice } from "@/components/dashboard/dashboard-requirements-notice"
import { InvoiceSummary } from "@/components/dashboard/invoice-summary"
import { dashboardContent } from "@/content/dashboard"
import { openStripePaymentMethodSetup } from "@/lib/actions/paymentActions"
import type { VouchCardDTO } from "@/lib/dto/vouch.mappers"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"

type InvoiceSummaryData = ComponentProps<typeof InvoiceSummary>
type StatItem = ComponentProps<typeof StatsCards>["stats"][number]
type VouchStatusTone = NonNullable<InvoiceSummaryData["tone"]>

function formatDate(value: string | null | undefined) {
  if (!value) return dashboardContent.fallbackDeadline

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return dashboardContent.fallbackDeadline

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatParticipantName(vouch: VouchCardDTO) {
  return (
    vouch.customer?.displayName ??
    vouch.customer?.email ??
    vouch.merchant?.displayName ??
    vouch.merchant?.email ??
    "Participant"
  )
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function getStatusLabel(status: VouchCardDTO["status"]) {
  return status.replace(/_/g, " ")
}

function mapStatusTone(status: VouchCardDTO["status"]): VouchStatusTone {
  if (status === "captured") return "complete"
  if (status === "expired") return "expired"
  if (status === "protocol_fee_paid" || status === "authorized" || status === "can_capture") {
    return "active"
  }

  return "pending"
}

function getRemainingLabel(value: string | null | undefined) {
  if (!value) return "No deadline"

  const remaining = new Date(value).getTime() - Date.now()

  if (remaining <= 0) return "Due now"

  const hours = Math.ceil(remaining / 3_600_000)

  if (hours < 48) {
    return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(hours, "hour")
  }

  return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
    Math.ceil(hours / 24),
    "day"
  )
}

function getPercentRemaining(vouch: VouchCardDTO) {
  const expiresAt = vouch.confirmationExpiresAt ?? vouch.appointmentAt

  if (!expiresAt) return 0

  const now = Date.now()
  const createdAt = vouch.createdAt ? new Date(vouch.createdAt).getTime() : now
  const expiresAtMs = new Date(expiresAt).getTime()
  const total = Math.max(expiresAtMs - createdAt, 1)
  const remaining = expiresAtMs - now

  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

function mapVouchToInvoice(vouch: VouchCardDTO): InvoiceSummaryData {
  const tone = mapStatusTone(vouch.status)
  const deadline = vouch.confirmationExpiresAt ?? vouch.appointmentAt

  return {
    invoiceNumber: vouch.publicId,
    clientName: formatParticipantName(vouch),
    issueDate: formatDate(vouch.createdAt),
    dueDate: formatDate(deadline),
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

export async function DashboardFeature({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const state = await getDashboardPageState(searchParams ? { searchParams } : undefined)
  const sections = state.summary?.sections
  const dashboardBlocked = state.warnings.paymentMethodRequired

  const drafts = sections?.drafts ?? []
  const actionRequired = sections?.actionRequired ?? []
  const active = sections?.active ?? []
  const completed = sections?.completed ?? []
  const expired = sections?.expired ?? []

  const invoices: InvoiceSummaryData[] = [
    ...drafts.map(mapVouchToInvoice),
    ...actionRequired.map(mapVouchToInvoice),
    ...active.map(mapVouchToInvoice),
    ...completed.map(mapVouchToInvoice),
    ...expired.map(mapVouchToInvoice),
  ]

  const counts = state.summary?.counts
  const draftCount = counts?.drafts ?? drafts.length
  const activeCount = counts?.active ?? active.length
  const completedCount = counts?.completed ?? completed.length
  const actionRequiredCount = counts?.actionRequired ?? actionRequired.length

  const metrics: StatItem[] = [
    {
      label: "Drafts",
      value: String(draftCount),
    },
    {
      label: "Active",
      value: String(activeCount),
    },
    {
      label: "Action",
      value: String(actionRequiredCount),
    },
    {
      label: "Completed",
      value: String(completedCount),
    },
  ]

  return (
    <main className="mb-16">
      <HeroCentered
        eyebrow={dashboardContent.hero.eyebrow}
        title={dashboardContent.hero.title}
        description=""
        align="left"
      />
      {dashboardBlocked ? (
        <DashboardRequirementsNotice action={openStripePaymentMethodSetup} />
      ) : null}

      <StatsCards stats={metrics} />

      {state.variant === "empty" ? (
        <DashboardEmptyState />
      ) : (
        invoices.map((invoice) => (
          <InvoiceSummary
            key={invoice.vouchId ?? invoice.invoiceNumber}
            {...invoice}
            disabled={dashboardBlocked}
          />
        ))
      )}
    </main>
  )
}
