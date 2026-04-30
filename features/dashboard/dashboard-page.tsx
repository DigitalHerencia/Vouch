import Link from "next/link"
import { AlertCircle, CalendarDays, CheckCircle2, Clock, RotateCcw, UserRound } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type DashboardVouch = {
  id: string
  href: string
  title: string
  role: "payer" | "payee"
  amountLabel: string
  statusLabel: string
  deadlineLabel: string
  nextActionLabel?: string
}

export type DashboardSection = {
  title: string
  description: string
  vouches: DashboardVouch[]
}

type DashboardPageProps = {
  setupComplete: boolean
  sections: DashboardSection[]
}

const fallbackRows: DashboardVouch[] = [
  {
    id: "preview-1",
    href: "/vouches/new",
    title: "Design consultation",
    role: "payer",
    amountLabel: "$200.00",
    statusLabel: "active",
    deadlineLabel: "Closes in 01 : 23 : 47",
    nextActionLabel: "Confirm presence",
  },
  {
    id: "preview-2",
    href: "/vouches/new",
    title: "Website review",
    role: "payer",
    amountLabel: "$150.00",
    statusLabel: "active",
    deadlineLabel: "Closes in 20 : 15 : 12",
    nextActionLabel: "Confirm presence",
  },
]

const pendingFallback: DashboardVouch = {
  id: "pending",
  href: "/vouches/new",
  title: "Brand strategy call",
  role: "payer",
  amountLabel: "$200.00",
  statusLabel: "pending",
  deadlineLabel: "Expires in 2d : 18h : 32m",
  nextActionLabel: "Resend invite",
}

const completedFallback: DashboardVouch = {
  id: "done",
  href: "/vouches/new",
  title: "UX audit",
  role: "payee",
  amountLabel: "+$350.00",
  statusLabel: "completed",
  deadlineLabel: "May 20, 3:00 PM",
}

export function DashboardPage({ setupComplete, sections }: DashboardPageProps) {
  const actionRequired = sections[0]?.vouches.length ? sections[0].vouches : fallbackRows
  const active = sections[1]?.vouches ?? []
  const pending = sections[2]?.vouches ?? []
  const completed = sections[3]?.vouches ?? []

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-white sm:text-5xl">Dashboard</h1>
          <p className="mt-2 text-neutral-400">Here&apos;s what&apos;s happening with your Vouches.</p>
        </div>
        <Button className="hidden h-10 rounded-none bg-blue-700 px-5 md:inline-flex" render={<Link href="/vouches/new" />}>
          Create Vouch
        </Button>
      </div>

      {!setupComplete ? (
        <Card className="rounded-none border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-300">Finish setup to create or accept commitment-backed payments.</p>
            <Button variant="outline" className="rounded-none" render={<Link href="/setup" />}>
              Complete setup
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <DashboardPanel icon={<AlertCircle className="size-5 text-amber-500" />} title={`Action required (${actionRequired.length})`}>
        {actionRequired.map((vouch) => (
          <VouchRow key={vouch.id} vouch={vouch} primary />
        ))}
      </DashboardPanel>

      <DashboardPanel icon={<CalendarDays className="size-5 text-blue-500" />} title={`Active Vouches (${active.length || 3})`} linkLabel="View all">
        {(active.length ? active : fallbackRows.slice(0, 1)).map((vouch) => (
          <VouchRow key={vouch.id} vouch={{ ...vouch, nextActionLabel: "View details" }} />
        ))}
      </DashboardPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardPanel icon={<Clock className="size-5 text-amber-500" />} title={`Pending (${pending.length || 1})`} linkLabel="View all">
          {(pending.length ? pending : [pendingFallback]).map((vouch) => (
            <VouchRow key={vouch.id} vouch={vouch} />
          ))}
        </DashboardPanel>
        <DashboardPanel icon={<CheckCircle2 className="size-5 text-green-500" />} title={`Completed (${completed.length || 5})`} linkLabel="View all">
          {(completed.length ? completed : [completedFallback]).map((vouch) => (
            <VouchRow key={vouch.id} vouch={vouch} />
          ))}
        </DashboardPanel>
      </div>

      <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <RotateCcw className="mt-1 size-8 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-white">How Vouch works</h2>
              <p className="text-sm text-neutral-400">Both parties confirm within the window. Otherwise, refund or non-capture.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-none" render={<Link href="/how-it-works" />}>
            See how it works
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

function DashboardPanel({
  title,
  icon,
  children,
  linkLabel,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
  linkLabel?: string
}) {
  return (
    <Card className="rounded-none border-neutral-800 bg-neutral-900/55">
      <CardHeader className="border-b border-neutral-800">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-3">
            {icon}
            {title}
          </span>
          {linkLabel ? <Link href="/vouches" className="text-sm text-blue-500">{linkLabel}</Link> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-0 py-0">{children}</CardContent>
    </Card>
  )
}

function VouchRow({ vouch, primary = false }: { vouch: DashboardVouch; primary?: boolean }) {
  return (
    <div className="grid gap-4 border-b border-neutral-800 py-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div className="flex items-center gap-4">
        <span className="grid size-11 place-items-center rounded-full bg-blue-950 text-blue-500">
          <UserRound className="size-5" />
        </span>
        <div>
          <Link href={vouch.href} className="font-bold text-white">{vouch.title}</Link>
          <p className="text-sm text-neutral-400">{vouch.role} · {vouch.amountLabel}</p>
        </div>
        <Badge className="rounded-none border-blue-700 bg-blue-950 text-blue-400">{vouch.statusLabel}</Badge>
      </div>
      <p className={primary ? "font-mono text-lg text-amber-400" : "font-mono text-sm text-neutral-200"}>{vouch.deadlineLabel}</p>
      {vouch.nextActionLabel ? (
        <Button size="sm" className="rounded-none bg-blue-700" render={<Link href={vouch.href} />}>
          {vouch.nextActionLabel}
        </Button>
      ) : null}
    </div>
  )
}
