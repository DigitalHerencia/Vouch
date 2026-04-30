import Link from "next/link"
import { ArrowUpRight, FileCheck2, Plus, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type VouchListItem = {
  id: string
  href: string
  title: string
  statusLabel: string
  roleLabel: string
  amountLabel: string
  deadlineLabel: string
  nextActionLabel?: string
}

type VouchListPageProps = { title?: string; items: VouchListItem[] }

export function VouchListPage({ title = "Vouches", items }: VouchListPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="vouch-label text-blue-500">Participant ledger</p>
          <h1 className="mt-3 font-heading text-5xl text-white sm:text-6xl">{title}</h1>
          <p className="mt-3 text-neutral-400">Participant-scoped Vouches only.</p>
        </div>
        <Button className="h-11 rounded-none bg-blue-700 px-5" render={<Link href="/vouches/new" />}>
          <Plus />
          Create Vouch
        </Button>
      </div>
      {items.length === 0 ? (
        <Card className="rounded-none border-2 border-neutral-800 bg-black/55">
          <CardContent className="grid gap-6 py-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-5 inline-grid size-14 place-items-center border-2 border-blue-700 bg-blue-950/30">
                <FileCheck2 className="text-blue-500" />
              </div>
              <h2 className="text-4xl">No Vouches yet.</h2>
              <p className="mt-3 max-w-2xl text-neutral-400">
                Create a Vouch to back an appointment or in-person agreement with a clear payment
                commitment. Both parties confirm presence; otherwise refund, void, or non-capture.
              </p>
            </div>
            <div className="grid gap-3 border border-neutral-800 bg-neutral-950/70 p-4">
              <Badge className="w-fit rounded-none bg-blue-700 font-mono uppercase">Next action</Badge>
              <p className="text-sm text-neutral-300">Start with amount, meeting window, confirmation deadline, and recipient.</p>
              <Button className="rounded-none bg-blue-700" render={<Link href="/vouches/new" />}>
                Create Vouch
                <ArrowUpRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="rounded-none border-2 border-neutral-800 bg-neutral-950/65">
              <CardHeader className="border-b border-neutral-800">
                <CardTitle className="flex items-center gap-3 text-base">
                  <ShieldCheck className="text-blue-500" />
                  {item.statusLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid gap-1">
                  <Link href={item.href} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-sm text-neutral-400">
                    {item.roleLabel} · {item.statusLabel} · {item.deadlineLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">{item.amountLabel}</span>
                  {item.nextActionLabel ? (
                    <Button size="sm" className="rounded-none bg-blue-700" render={<Link href={item.href} />}>
                      {item.nextActionLabel}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
