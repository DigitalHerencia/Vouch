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
import {
  formatCurrency,
  formatDateTime,
  formatParticipantName,
  getPercentRemaining,
  getRemainingLabel,
  getStatusLabel,
  mapStatusTone,
} from "@/lib/utils/dashboardUtils"
import { formatDate } from "date-fns"
import { mapVouchToInvoice } from "@/lib/dto/dashboard.mappers"
import type { InvoiceSummaryData } from "@/types/dashboardTypes"

export async function DashboardFeature({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const state = await getDashboardPageState(searchParams ? { searchParams } : undefined)
  const sections = state.summary?.sections
  const showPaymentMethodNotice = state.warnings.paymentMethodRequired

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
      {showPaymentMethodNotice ? (
        <DashboardRequirementsNotice action={openStripePaymentMethodSetup} />
      ) : null}

      <div
        aria-disabled={showPaymentMethodNotice}
        className={showPaymentMethodNotice ? "pointer-events-none opacity-50" : undefined}
      >
        <StatsCards stats={metrics} />

        {state.variant === "empty" ? (
          <DashboardEmptyState />
        ) : (
          invoices.map((invoice) => (
            <InvoiceSummary
              key={invoice.vouchId ?? invoice.invoiceNumber}
              {...invoice}
              disabled={showPaymentMethodNotice}
            />
          ))
        )}
      </div>
    </main>
  )
}
