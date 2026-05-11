import Link from "next/link"
import { ArrowUpRight, FileCheck2, Plus, ShieldCheck } from "lucide-react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionIntro
          eyebrow="Participant ledger"
          title={title}
          body="Participant-scoped Vouches only."
        />
        <Button className="h-11 rounded-none bg-blue-700 px-5" render={<Link href="/vouches/new" />}>
          <Plus />
          Create Vouch
        </Button>
      </div>
      {items.length === 0 ? (
        <CalloutPanel
          icon={FileCheck2}
          title="No Vouches yet."
          body="Create a Vouch to back an appointment or in-person agreement with a clear payment commitment. Both parties confirm presence; otherwise refund, void, or non-capture."
          actions={
            <div className="grid gap-3 border border-neutral-800 bg-neutral-950/70 p-4">
              <Badge className="w-fit rounded-none bg-blue-700 font-mono uppercase">Next action</Badge>
              <p className="max-w-80 text-sm text-neutral-300">
                Start with amount, meeting window, confirmation deadline, and recipient.
              </p>
              <Button className="rounded-none bg-blue-700" render={<Link href="/vouches/new" />}>
                Create Vouch
                <ArrowUpRight />
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Surface key={item.id} variant="muted">
              <SurfaceHeader>
                <h2 className="flex items-center gap-3 font-(family-name:--font-display) text-[18px] leading-none tracking-[0.08em] text-white uppercase">
                  <ShieldCheck className="text-blue-500" />
                  {item.statusLabel}
                </h2>
              </SurfaceHeader>
              <SurfaceBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              </SurfaceBody>
            </Surface>
          ))}
        </div>
      )}
    </main>
  )
}
