import Link from "next/link"

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

export function DashboardPage({ setupComplete, sections }: DashboardPageProps) {
  const hasAnyVouches = sections.some((section) => section.vouches.length > 0)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2"><h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1><p className="text-muted-foreground">Review active commitments, required actions, and final outcomes.</p></div>
        <Button render={<Link href="/vouches/new" />}>Create Vouch</Button>
      </div>
      {!setupComplete ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader><CardTitle>Finish setup to use Vouch</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Complete verification, payment, payout, or terms requirements to create and accept payment-backed Vouches.</p>
            <Button variant="outline" render={<Link href="/setup" />}>Review setup</Button>
          </CardContent>
        </Card>
      ) : null}
      {!hasAnyVouches ? (
        <Card><CardHeader><CardTitle>No Vouches yet.</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-muted-foreground">Create a Vouch to back an appointment or in-person agreement with a clear payment commitment. No browsing. No marketplace. Just a commitment link.</p><Button render={<Link href="/vouches/new" />}>Create Vouch</Button></CardContent></Card>
      ) : (
        sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <div><h2 className="text-xl font-semibold">{section.title}</h2><p className="text-sm text-muted-foreground">{section.description}</p></div>
            <div className="grid gap-3">
              {section.vouches.map((vouch) => (
                <Card key={vouch.id}>
                  <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1"><Link href={vouch.href} className="font-medium hover:underline">{vouch.title}</Link><p className="text-sm text-muted-foreground">{vouch.role} · {vouch.statusLabel} · {vouch.deadlineLabel}</p></div>
                    <div className="flex items-center gap-3"><span className="font-semibold tabular-nums">{vouch.amountLabel}</span>{vouch.nextActionLabel ? <Button size="sm" render={<Link href={vouch.href} />}>{vouch.nextActionLabel}</Button> : null}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
