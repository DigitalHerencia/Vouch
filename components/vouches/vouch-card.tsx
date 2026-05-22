import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface VouchCardProps {
  id: string
  href: string
  title: string
  role: "merchant" | "customer"
  amountLabel: string
  statusLabel: string
  deadlineLabel: string
  nextActionLabel?: string | undefined
  labels: {
    role: string
    amount: string
    deadline: string
  }
}

const statusTone = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes("completed")) return "border-blue-600 bg-blue-600 text-white"
  if (normalized.includes("expired")) return "border-red-600 bg-red-600 text-red-600"
  if (normalized.includes("confirm")) return "border-blue-600 bg-blue-600 text-white"
  if (normalized.includes("authorized")) return "border-blue-600 bg-blue-600 text-white"

  return "border-neutral-400 bg-black text-neutral-400"
}

export function VouchCard({
  id,
  href,
  title,
  role,
  amountLabel,
  statusLabel,
  deadlineLabel,
  nextActionLabel,
  labels,
}: VouchCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="group transition-transform hover:-translate-y-0.5">
        <CardContent className="grid gap-0 p-0 md:grid-cols-[1fr_2fr_1fr]">
          <div className="flex min-h-28 items-center border-b-2 border-neutral-400 p-5 md:border-r-2 md:border-b-0">
            <Badge className={`w-full justify-center ${statusTone(statusLabel)}`}>{statusLabel}</Badge>
          </div>

          <div className="grid min-h-28 border-b-2 border-neutral-400 md:border-r-2 md:border-b-0">
            <div className="grid gap-4 border-b-2 border-neutral-400 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-neutral-400 uppercase">{id}</p>
                <h3 className="mt-2 truncate font-(family-name:--font-display) text-4xl leading-none tracking-[0.03em] text-white uppercase">
                  {title}
                </h3>
              </div>
              <div>
                <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-400 uppercase">
                  {labels.amount}
                </p>
                <p className="mt-2 font-mono text-2xl font-black text-white">{amountLabel}</p>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <TimelineChip label={labels.role} value={role} />
              <TimelineChip label={labels.deadline} value={deadlineLabel} />
              <TimelineChip label="Action" value={nextActionLabel ?? "Open"} />
            </div>
          </div>

          <div className="flex min-h-28 flex-col justify-center p-5">
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-400 uppercase">
              Countdown
            </p>
            <p className="mt-3 font-mono text-lg leading-tight font-black text-white">
              {deadlineLabel}
            </p>
            <p className="mt-3 text-xs font-bold tracking-[0.12em] text-blue-600 uppercase">
              Open details
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function TimelineChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-white capitalize">{value}</p>
    </div>
  )
}
