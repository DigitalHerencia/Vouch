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
import { CalloutPanel } from "@/components/landing/landing-callout-panel"
import { CtaPanel } from "@/components/shared/cta-panel"
import { MetricGrid, type MetricGridItem } from "@/components/landing/landing-metric-grid"
import { SectionIntro } from "@/components/landing/landing-section-intro"
import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"
import { cn } from "@/lib/utils"

type DashboardVouch = {
  id: string
  href: string
  title: string
  role: "payer" | "payee"
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

function toDashboardVouch(vouch: unknown): DashboardVouch {
  const record = vouch as Record<string, unknown>

  return {
    id: String(record.id),
    href: `/vouches/${record.id}`,
    title: String(record.label ?? record.publicId ?? "Vouch"),
    role: "payer",
    amountLabel: money(record.amountCents, record.currency),
    statusLabel: String(record.status ?? "active"),
    deadlineLabel: String(record.confirmationExpiresAt ?? "No deadline"),
    nextActionLabel: "Open",
  }
}

const fallbackActionRequired: DashboardVouch[] = [
  {
    id: "preview-1",
    href: "/setup",
    title: "Design consultation",
    role: "payer",
    amountLabel: "$200.00",
    statusLabel: "active",
    deadlineLabel: "Closes in 01 : 23 : 47",
    nextActionLabel: "Confirm presence",
  },
  {
    id: "preview-2",
    href: "/setup",
    title: "Website review",
    role: "payer",
    amountLabel: "$150.00",
    statusLabel: "active",
    deadlineLabel: "Closes in 20 : 15 : 12",
    nextActionLabel: "Confirm presence",
  },
]

const fallbackPending: DashboardVouch = {
  id: "pending-preview",
  href: "/setup",
  title: "Brand strategy call",
  role: "payer",
  amountLabel: "$200.00",
  statusLabel: "pending",
  deadlineLabel: "Expires in 2d : 18h : 32m",
  nextActionLabel: "Resend invite",
}

const fallbackCompleted: DashboardVouch = {
  id: "completed-preview",
  href: "/setup",
  title: "UX audit",
  role: "payee",
  amountLabel: "+$350.00",
  statusLabel: "completed",
  deadlineLabel: "May 20, 3:00 PM",
}

export async function DashboardPage() {
  const state = await getDashboardPageState()
  const sections = state.summary?.sections

  const dashboardSections: DashboardSection[] = [
    {
      title: "Action required",
      description: "Vouches that need your attention.",
      vouches: (sections?.actionRequired ?? []).map(toDashboardVouch),
    },
    {
      title: "Pending",
      description: "Created Vouches awaiting acceptance.",
      vouches: (sections?.pending ?? []).map(toDashboardVouch),
    },
    {
      title: "Completed",
      description: "Final Vouches where both parties confirmed.",
      vouches: (sections?.completed ?? []).map(toDashboardVouch),
    },
  ]

  const actionRequired = dashboardSections[0]?.vouches.length
    ? dashboardSections[0].vouches
    : fallbackActionRequired
  const pending = dashboardSections[1]?.vouches.length
    ? dashboardSections[1].vouches
    : [fallbackPending]
  const completed = dashboardSections[2]?.vouches.length
    ? dashboardSections[2].vouches
    : [fallbackCompleted]

  const pendingCount = sections?.pending?.length ?? 0
  const completedCount = sections?.completed?.length ?? 0
  const actionRequiredCount = sections?.actionRequired?.length ?? actionRequired.length
  const setupComplete = state.variant !== "empty"

  const metrics: MetricGridItem[] = [
    {
      label: "Pending Vouches",
      value: String(pendingCount || pending.length),
      body: "Invites created or waiting on the other party.",
    },
    {
      label: "Past Vouches",
      value: String(completedCount),
      body: "Completed, refunded, expired, or otherwise resolved.",
    },
    {
      label: "Active Value",
      value: money(
        [...(sections?.active ?? []), ...(sections?.actionRequired ?? [])].reduce(
          (sum, vouch) => sum + Number((vouch as Record<string, unknown>).amountCents ?? 0),
          0
        ),
        "usd"
      ),
      body: "Payment-coordination value currently in motion.",
    },
    {
      label: "Needs Review",
      value: String(actionRequiredCount),
      body: "Items waiting on confirmation, setup, or attention.",
    },
  ]

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 pt-8 pb-12 sm:px-10 lg:px-12 lg:pt-10 lg:pb-14">
      <SectionIntro
        eyebrow="Participant ledger"
        title="Dashboard"
        body="Here's what's happening with your Vouches. Amount, status, deadline, and consequence stay visible."
      />

      {!setupComplete ? (
        <CalloutPanel
          title="Finish setup before creating or accepting Vouches."
          body="Complete readiness checks so Vouch can coordinate payment state, confirmation windows, and deterministic outcomes."
          icon={AlertCircle}
          actions={
            <Button variant="primary" size="cta" render={<Link href="/setup" />}>
              Complete setup
              <ArrowRight className="size-5" strokeWidth={1.9} />
            </Button>
          }
        />
      ) : null}

      <MetricGrid items={metrics} />

      <DashboardListPanel
        title={`Action required (${actionRequired.length})`}
        description="The next thing to handle. No ambiguity, no buried state."
        icon={Bell}
        rows={actionRequired}
      />

      <DashboardListPanel
        title={`Pending (${pending.length})`}
        description="Vouches waiting on acceptance or invite follow-up."
        icon={Clock}
        rows={pending}
      />

      <DashboardListPanel
        title={`Completed (${completed.length})`}
        description="Outcomes that followed system state."
        icon={CheckCircle2}
        rows={completed}
      />

      <CtaPanel
        title="Create a Vouch"
        body="Create the agreement, send the invite, and let dual confirmation determine release, refund, void, or non-capture."
        cta="Create Vouch"
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
  icon: Icon,
  rows,
}: {
  title: string
  description: string
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
        <Button variant="link" render={<Link href="/vouches" />}>
          View all
        </Button>
      </SurfaceHeader>

      <div>
        {rows.map((vouch) => (
          <DashboardVouchRow key={vouch.id} vouch={vouch} />
        ))}
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
              className="font-(family-name:--font-display) text-[22px] leading-none tracking-[0.05em] text-white uppercase hover:text-[#1D4ED8]"
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
