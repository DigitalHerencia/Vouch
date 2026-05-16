import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Handshake,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CtaPanel } from "@/components/shared/cta-panel"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { StatusStrip, type StatusStripItem } from "@/components/shared/status-strip"
import { SectionIntro } from "@/components/shared/section-intro"
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

  const metrics: StatusStripItem[] = [
    {
      label: dashboardContent.metrics.activeVouches.label,
      value: String(activeCount || active.length),
      body: dashboardContent.metrics.activeVouches.body,
    },
    {
      label: dashboardContent.metrics.pastVouches.label,
      value: String(completedCount),
      body: dashboardContent.metrics.pastVouches.body,
    },
    {
      label: dashboardContent.metrics.actionRequired.label,
      value: String(actionRequiredCount),
      body: dashboardContent.metrics.actionRequired.body,
    },
  ]

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 pt-8 pb-12 sm:px-10 lg:px-12 lg:pt-10 lg:pb-14">
      <SectionIntro
        eyebrow={dashboardContent.hero.eyebrow}
        title={dashboardContent.hero.title}
        body={dashboardContent.hero.body}
      />

      {!readinessComplete ? (
        <CalloutPanel
          title={dashboardContent.readiness.title}
          body={dashboardContent.readiness.body}
          icon={AlertCircle}
          actions={
            <Button variant="primary" size="cta" render={<Link href="/dashboard" />}>
              {dashboardContent.readiness.cta}
              <ArrowRight className="size-5" strokeWidth={1.9} />
            </Button>
          }
        />
      ) : null}

      <StatusStrip items={metrics} />

      <VouchCardList
        title={`Action required (${actionRequired.length})`}
        description={dashboardContent.sections.actionRequired.panelDescription}
        emptyText={dashboardContent.sections.actionRequired.emptyText}
        icon={Bell}
        rows={actionRequired}
      />

      <VouchCardList
        title={`Active (${active.length})`}
        description={dashboardContent.sections.active.panelDescription}
        emptyText={dashboardContent.sections.active.emptyText}
        icon={Clock}
        rows={active}
      />

      <VouchCardList
        title={`Completed (${completed.length})`}
        description={dashboardContent.sections.completed.panelDescription}
        emptyText={dashboardContent.sections.completed.emptyText}
        icon={CheckCircle2}
        rows={completed}
      />

      <CtaPanel
        title={dashboardContent.cta.title}
        body={dashboardContent.cta.body}
        cta={dashboardContent.cta.label}
        href="/vouches/new"
        icon={Handshake}
        className="mt-0"
      />
    </main>
  )
}
