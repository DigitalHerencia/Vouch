import { UserRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export interface VouchCardProps {
  vouch: {
    id: string
    href: string
    title: string
    role: "merchant" | "customer"
    amountLabel: string
    statusLabel: string
    deadlineLabel: string
    nextActionLabel?: string
  }
}

export function VouchCard({ vouch }: VouchCardProps) {
  return (
    <article className="grid gap-5 border-b border-neutral-800 px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 lg:min-h-31">
      <div className="flex items-start gap-5">
        <span className="grid size-11 shrink-0 place-items-center border border-primary bg-primary/15 text-primary">
          <UserRound className="size-5" strokeWidth={1.9} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={vouch.href} className="text-[22px] leading-none text-white hover:text-primary">
              {vouch.title}
            </Link>
            <span className="border border-primary bg-primary/15 px-2.5 py-1 font-mono text-[11px] font-black tracking-[0.08em] text-primary uppercase">
              {vouch.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-[15px] leading-tight font-semibold text-neutral-400">
            {vouch.role} - {vouch.amountLabel}
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
