import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Handshake,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CtaPanel } from "@/components/shared/cta-panel"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid, type MetricGridItem } from "@/components/shared/metric-grid"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceHeader } from "@/components/shared/surface"
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

  const metrics: MetricGridItem[] = [
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
      label: dashboardContent.metrics.activeValue.label,
      value: money(
        [...(sections?.active ?? []), ...(sections?.actionRequired ?? [])].reduce(
          (sum, vouch) => sum + vouch.protectedAmountCents,
          0
        ),
        "usd"
      ),
      body: dashboardContent.metrics.activeValue.body,
    },
    {
      label: dashboardContent.metrics.needsReview.label,
      value: String(actionRequiredCount),
      body: dashboardContent.metrics.needsReview.body,
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

      <MetricGrid items={metrics} />

      <DashboardListPanel
        title={`Action required (${actionRequired.length})`}
        description={dashboardContent.sections.actionRequired.panelDescription}
        emptyText={dashboardContent.sections.actionRequired.emptyText}
        icon={Bell}
        rows={actionRequired}
      />

      <DashboardListPanel
        title={`Active (${active.length})`}
        description={dashboardContent.sections.active.panelDescription}
        emptyText={dashboardContent.sections.active.emptyText}
        icon={Clock}
        rows={active}
      />

      <DashboardListPanel
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

function DashboardListPanel({
  title,
  description,
  emptyText,
  icon: Icon,
  rows,
}: {
  title: string
  description: string
  emptyText: string
  icon: typeof ShieldCheck
  rows: DashboardVouch[]
}) {
  return (
    <Surface>
      <SurfaceHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 text-[#1D4ED8]" strokeWidth={1.9} />
          <div>
            <h2 className="font-(family-name:--font-display) text-[24px] leading-none tracking-[0.07em] text-white uppercase sm:text-[30px]">
              {title}
            </h2>
            <p className="mt-2 text-[15px] leading-[1.3] font-semibold text-neutral-400">
              {description}
            </p>
          </div>
        </div>
        <Button variant="link" render={<Link href="/vouches/new" />}>
          {dashboardContent.actions.create}
        </Button>
      </SurfaceHeader>

      <div>
        {rows.length ? (
          rows.map((vouch) => <DashboardVouchRow key={vouch.id} vouch={vouch} />)
        ) : (
          <p className="border-t border-neutral-800 px-5 py-6 text-[15px] font-semibold text-neutral-400 sm:px-7">
            {emptyText}
          </p>
        )}
      </div>
    </Surface>
  )
}

function DashboardVouchRow({ vouch }: { vouch: DashboardVouch }) {
  return (
    <article className="grid gap-5 border-b border-neutral-800 px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 lg:min-h-31">
      <div className="flex items-start gap-5">
        <span className="grid size-11 shrink-0 place-items-center border border-[#1D4ED8] bg-[#1D4ED8]/15 text-[#1D4ED8]">
          <UserRound className="size-5" strokeWidth={1.9} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={vouch.href}
              className="font-(family-name:--font-display) text-[22px] leading-none tracking-wider text-white uppercase hover:text-[#1D4ED8]"
            >
              {vouch.title}
            </Link>
            <StatusPill label={vouch.statusLabel} />
          </div>
          <p className="mt-2 text-[15px] leading-tight font-semibold text-neutral-400">
            {vouch.role} · {vouch.amountLabel}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:justify-items-end">
        <p className="font-mono text-sm font-black tracking-[0.02em] text-white uppercase tabular-nums">
          {vouch.deadlineLabel}
        </p>
        {vouch.nextActionLabel ? (
          <Button size="sm" variant="primary" render={<Link href={vouch.href} />}>
            {vouch.nextActionLabel}
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="border border-[#1D4ED8] bg-[#1D4ED8]/15 px-2.5 py-1 font-mono text-[11px] font-black tracking-[0.08em] text-blue-100 uppercase">
      {label}
    </span>
  )
}
