import { AlertCircle, Bell, CheckCircle2, Clock, Handshake } from "lucide-react"

import { CTASection } from "@/components/blocks/cta-section"
import { HeroSection } from "@/components/blocks/hero-section"
import { StatsSection, type StatItem } from "@/components/blocks/stats-section"
import { VouchCardList } from "@/components/vouches/vouch-card-list"
import { dashboardContent } from "@/content/dashboard"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"
import type { VouchCardDTO } from "@/lib/dto/vouch.mappers"

type DashboardVouch = {
  id: string
  href: string
  title: string
  role: "merchant" | "customer"
  amountLabel: string
  statusLabel: string
  deadlineLabel: string
  nextActionLabel?: string
  labels: {
    role: string
    amount: string
    deadline: string
  }
}

type DashboardSection = {
  title: string
  description: string
  vouches: DashboardVouch[]
}

const money = (cents: unknown, currency: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency ?? "usd").toUpperCase(),
  }).format(Number(cents ?? 0) / 100)

const dateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : dashboardContent.fallbackDeadline

function toDashboardVouch(vouch: VouchCardDTO, userId: string): DashboardVouch {
  return {
    id: vouch.id,
    href: `/vouches/${vouch.id}`,
    title: vouch.publicId,
    role: vouch.merchantId === userId ? "merchant" : "customer",
    amountLabel: money(vouch.protectedAmountCents, vouch.currency),
    statusLabel: vouch.status,
    deadlineLabel: dateTime(vouch.confirmationExpiresAt),
    nextActionLabel: dashboardContent.actions.open,
    labels: dashboardContent.labels,
  }
}

export async function DashboardPage() {
  const state = await getDashboardPageState()
  const sections = state.summary?.sections

  const dashboardSections: DashboardSection[] = [
    {
      title: dashboardContent.sections.actionRequired.title,
      description: dashboardContent.sections.actionRequired.description,
      vouches: (sections?.actionRequired ?? []).map((vouch) =>
        toDashboardVouch(vouch, state.summary?.userId ?? "")
      ),
    },
    {
      title: dashboardContent.sections.active.title,
      description: dashboardContent.sections.active.description,
      vouches: (sections?.active ?? []).map((vouch) =>
        toDashboardVouch(vouch, state.summary?.userId ?? "")
      ),
    },
    {
      title: dashboardContent.sections.completed.title,
      description: dashboardContent.sections.completed.description,
      vouches: (sections?.completed ?? []).map((vouch) =>
        toDashboardVouch(vouch, state.summary?.userId ?? "")
      ),
    },
  ]

  const actionRequired = dashboardSections[0]?.vouches ?? []
  const active = dashboardSections[1]?.vouches ?? []
  const completed = dashboardSections[2]?.vouches ?? []

  const activeCount = sections?.active?.length ?? 0
  const completedCount = sections?.completed?.length ?? 0
  const actionRequiredCount = sections?.actionRequired?.length ?? 0
  const readinessComplete = state.variant !== "empty"

  const metrics: StatItem[] = [
    {
      label: dashboardContent.metrics.activeVouches.label,
      value: String(activeCount || active.length),
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
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <section className="grid min-h-0 gap-4 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <HeroSection.Minimal
          title={dashboardContent.hero.title}
          description={dashboardContent.hero.body}
        />

        <StatsSection.Cards stats={metrics} />
      </section>

      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:gap-8">
        {!readinessComplete ? (
          <CTASection.WithBackground
            title={dashboardContent.readiness.title}
            description={dashboardContent.readiness.body}
            icon={<AlertCircle className="size-8" />}
            primaryAction={{ label: dashboardContent.readiness.cta, href: "/dashboard" }}
          />
        ) : null}

        <VouchCardList
          title={`Action required (${actionRequired.length})`}
          description={dashboardContent.sections.actionRequired.panelDescription}
          emptyText={dashboardContent.sections.actionRequired.emptyText}
          icon={Bell}
          rows={actionRequired}
          labels={{
            eyebrow: dashboardContent.labels.vouchIndex,
            emptyEyebrow: dashboardContent.labels.noRecords,
          }}
        />

        <VouchCardList
          title={`Active (${active.length})`}
          description={dashboardContent.sections.active.panelDescription}
          emptyText={dashboardContent.sections.active.emptyText}
          icon={Clock}
          rows={active}
          labels={{
            eyebrow: dashboardContent.labels.vouchIndex,
            emptyEyebrow: dashboardContent.labels.noRecords,
          }}
        />

        <VouchCardList
          title={`Completed (${completed.length})`}
          description={dashboardContent.sections.completed.panelDescription}
          emptyText={dashboardContent.sections.completed.emptyText}
          icon={CheckCircle2}
          rows={completed}
          labels={{
            eyebrow: dashboardContent.labels.vouchIndex,
            emptyEyebrow: dashboardContent.labels.noRecords,
          }}
        />

        <CTASection.WithBackground
          title={dashboardContent.cta.title}
          description={dashboardContent.cta.body}
          icon={<Handshake className="size-8" />}
          primaryAction={{ label: dashboardContent.cta.label, href: "/vouches/new" }}
        />
      </section>
    </main>
  )
}
