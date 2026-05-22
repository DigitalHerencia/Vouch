import { CTABanner, CTASplit } from "@/components/blocks/cta-section"
import { HeroCentered } from "@/components/blocks/hero-section"
import { InvoiceList, type InvoiceListItem } from "@/components/blocks/invoice"
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

function formatClientName(vouch: VouchCardDTO) {
  return (
    vouch.customer?.displayName ??
    vouch.customer?.email ??
    vouch.merchant?.displayName ??
    vouch.merchant?.email ??
    "Participant"
  )
}

function mapInvoiceStatus(
  section: "actionRequired" | "active" | "completed" | "expired"
): InvoiceListItem["status"] {
  if (section === "completed") return "paid"
  if (section === "expired") return "overdue"

  return "pending"
}

function mapVouchToInvoice(
  vouch: VouchCardDTO,
  section: "actionRequired" | "active" | "completed" | "expired"
): InvoiceListItem {
  return {
    id: vouch.id,
    invoiceNumber: vouch.publicId,
    clientName: formatClientName(vouch),
    date: formatDate(vouch.confirmationExpiresAt ?? vouch.appointmentStartsAt),
    amount: vouch.customerTotalCents / 100,
    status: mapInvoiceStatus(section),
  }
}

export async function DashboardFeature() {
  const state = await getDashboardPageState()
  const sections = state.summary?.sections

  const actionRequired = sections?.actionRequired ?? []
  const active = sections?.active ?? []
  const completed = sections?.completed ?? []
  const expired = sections?.expired ?? []

  const invoices: InvoiceListItem[] = [
    ...actionRequired.map((vouch) => mapVouchToInvoice(vouch, "actionRequired")),
    ...active.map((vouch) => mapVouchToInvoice(vouch, "active")),
    ...completed.map((vouch) => mapVouchToInvoice(vouch, "completed")),
    ...expired.map((vouch) => mapVouchToInvoice(vouch, "expired")),
  ]

  const counts = state.summary?.counts
  const activeCount = counts?.active ?? active.length
  const completedCount = counts?.completed ?? completed.length
  const actionRequiredCount = counts?.actionRequired ?? actionRequired.length
  const readinessComplete = state.variant !== "empty"

  const metrics: StatItem[] = [
    {
      label: dashboardContent.metrics.activeVouches.label,
      value: String(activeCount),
      description: dashboardContent.metrics.activeVouches.body,
    },
    {
      label: dashboardContent.metrics.pastVouches.label,
      value: String(completedCount),
      description: dashboardContent.metrics.pastVouches.body,
    },
    {
      label: dashboardContent.metrics.actionRequired.label,
      value: String(actionRequiredCount),
      description: dashboardContent.metrics.actionRequired.body,
    },
  ]

  return (
    <main>
      {!readinessComplete ? (
        <div className="sticky top-18 z-40 w-full">
          <CTABanner
            text={dashboardContent.readiness.body}
            action={{ label: dashboardContent.readiness.cta, href: "/vouches/new" }}
            dismissible
          />
        </div>
      ) : null}

      <section className="px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="grid gap-8 md:gap-12">
          <HeroCentered
            badge={dashboardContent.hero.eyebrow}
            title={dashboardContent.hero.title}
            description={dashboardContent.hero.body}
            primaryAction={{ label: dashboardContent.actions.create, href: "/vouches/new" }}
          />

          <StatsCards title="Coordination Metrics" subtitle="Vouch" stats={metrics} />

          <InvoiceList invoices={invoices} />

          <CTASplit
            title={dashboardContent.cta.title}
            description={dashboardContent.cta.body}
            imageSrc="/logo-light.png"
            imageAlt="Vouch"
            primaryAction={{ label: dashboardContent.cta.label, href: "/vouches/new" }}
          />
        </div>
      </section>
    </main>
  )
}
