// features/dashboard/dashboardFeature.tsx

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { DashboardRequirementsNotice } from "@/components/dashboard/dashboard-requirements-notice"
import { InvoiceSummaryList } from "@/components/dashboard/invoice-summary"
import { HeroCentered } from "@/components/shared/hero-centered"
import { StatsCards } from "@/components/shared/stats-cards"
import { dashboardContent } from "@/content/dashboard"
import { openStripePaymentMethodSetup } from "@/lib/actions/paymentActions"
import { mapVouchToInvoice } from "@/lib/dto/dashboard.mappers"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"
import type {
  DashboardPageStateDTO,
  DashboardSectionKey,
  DashboardStatItem,
  DashboardSummaryDTO,
  InvoiceSummaryData,
} from "@/types/dashboardTypes"

const DEFAULT_SECTION_ORDER: DashboardSectionKey[] = [
  "drafts",
  "actionRequired",
  "active",
  "completed",
  "expired",
]

function getDashboardMetrics(summary: DashboardSummaryDTO | null): DashboardStatItem[] {
  const counts = summary?.counts

  return [
    {
      label: "Drafts",
      value: String(counts?.drafts ?? 0),
    },
    {
      label: "Active",
      value: String(counts?.active ?? 0),
    },
    {
      label: "Action required",
      value: String(counts?.actionRequired ?? 0),
    },
    {
      label: "Completed",
      value: String(counts?.completed ?? 0),
    },
  ]
}

function getVisibleSectionOrder(state: DashboardPageStateDTO): DashboardSectionKey[] {
  if (state.filters.status === "all") return DEFAULT_SECTION_ORDER
  return [state.filters.status]
}

function getVisibleInvoices(state: DashboardPageStateDTO): InvoiceSummaryData[] {
  const sections = state.summary?.sections
  if (!sections) return []

  return getVisibleSectionOrder(state).flatMap((sectionKey) =>
    sections[sectionKey].map(mapVouchToInvoice)
  )
}

export async function DashboardFeature({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const state = await getDashboardPageState(searchParams ? { searchParams } : undefined)
  const showPaymentMethodNotice = state.warnings.paymentMethodRequired
  const metrics = getDashboardMetrics(state.summary)
  const invoices = getVisibleInvoices(state)

  return (
    <div className="pb-12">
      <HeroCentered
        eyebrow={dashboardContent.hero.eyebrow}
        title={dashboardContent.hero.title}
        description={dashboardContent.hero.body}
        align="left"
      />

      {showPaymentMethodNotice ? (
        <DashboardRequirementsNotice action={openStripePaymentMethodSetup} />
      ) : null}

      <div
        aria-disabled={showPaymentMethodNotice}
        className={[
          "grid gap-4 md:gap-8",
          showPaymentMethodNotice ? "pointer-events-none opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <StatsCards stats={metrics} />

        {invoices.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <InvoiceSummaryList invoices={invoices} disabled={showPaymentMethodNotice} />
        )}
      </div>
    </div>
  )
}
