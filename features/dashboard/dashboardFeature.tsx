import type { VouchStatusTone } from "@/components/blocks/status"
import { HeroCentered } from "@/components/blocks/hero-section"
import { InvoiceSummary, type InvoiceSummaryProps } from "@/components/blocks/invoice"
import { StatsCards, type StatItem } from "@/components/blocks/stats-section"
import { dashboardContent } from "@/content/dashboard"
import type { VouchCardDTO } from "@/lib/dto/vouch.mappers"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"

function formatDate(value: string | null) {
  if (!value) return dashboardContent.fallbackDeadline

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatDateTime(value: string | null) {
  if (!value) return dashboardContent.fallbackDeadline

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatClientName(vouch: VouchCardDTO) {
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

function mapStatusTone(status: VouchCardDTO["status"]): VouchStatusTone {
  if (status === "completed") return "complete"
  if (status === "expired") return "expired"
  if (status === "confirmable" || status === "authorized") return "active"

  return "pending"
}

function getCountdown(vouch: VouchCardDTO): InvoiceSummaryProps["countdown"] {
  if (!vouch.appointmentStartsAt) return undefined

  const now = Date.now()
  const createdAt = vouch.createdAt ? new Date(vouch.createdAt).getTime() : now
  const appointmentAt = new Date(vouch.appointmentStartsAt).getTime()
  const total = Math.max(appointmentAt - createdAt, 1)
  const remaining = appointmentAt - now
  const percentRemaining = Math.max(0, Math.min(100, (remaining / total) * 100))
  const remainingLabel =
    remaining <= 0
      ? "Due now"
      : new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
          Math.ceil(remaining / 3_600_000),
          "hour"
        )

  return {
    label: "Appointment countdown",
    expiresAtLabel: formatDateTime(vouch.appointmentStartsAt),
    remainingLabel,
    percentRemaining,
    tone: mapStatusTone(vouch.status),
  }
}

function mapVouchToInvoice(vouch: VouchCardDTO): InvoiceSummaryProps {
  return {
    invoiceNumber: vouch.publicId,
    clientName: formatClientName(vouch),
    issueDate: formatDate(vouch.createdAt),
    dueDate: formatDate(vouch.appointmentStartsAt ?? vouch.confirmationExpiresAt),
    amount: vouch.customerTotalCents / 100,
    amountLabel: formatCurrency(vouch.customerTotalCents, vouch.currency),
    status: vouch.status,
    statusTone: mapStatusTone(vouch.status),
    href: `/vouches/${vouch.id}`,
    vouchId: vouch.id,
    appointmentLabel: formatDateTime(vouch.appointmentStartsAt),
    confirmationWindowLabel: `${formatDateTime(vouch.confirmationOpensAt)} - ${formatDateTime(
      vouch.confirmationExpiresAt
    )}`,
    protectedAmountLabel: formatCurrency(vouch.protectedAmountCents, vouch.currency),
    countdown: getCountdown(vouch),
    label: formatDateTime(vouch.appointmentStartsAt),
    expiresAtLabel: formatDate(vouch.confirmationExpiresAt),
    remainingLabel: formatDateTime(vouch.confirmationOpensAt),
    percentRemaining: 0,
    tone: "active",
  }
}

export async function DashboardFeature() {
  const state = await getDashboardPageState()
  const sections = state.summary?.sections

  const drafts = sections?.drafts ?? []
  const actionRequired = sections?.actionRequired ?? []
  const active = sections?.active ?? []
  const completed = sections?.completed ?? []
  const expired = sections?.expired ?? []

  const invoices: InvoiceSummaryProps[] = [
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
      label: "Pending",
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

      <StatsCards stats={metrics} />

      {invoices.map((invoice) => (
        <InvoiceSummary key={invoice.vouchId ?? invoice.invoiceNumber} {...invoice} />
      ))}
    </main>
  )
}
