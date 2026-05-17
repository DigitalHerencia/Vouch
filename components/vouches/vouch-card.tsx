import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  className?: string | undefined
}

const statusTone = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes("completed")) return "border-emerald-500/45 bg-emerald-500/10 text-emerald-200"
  if (normalized.includes("expired")) return "border-red-500/45 bg-red-500/10 text-red-200"
  if (normalized.includes("confirm")) return "border-primary bg-primary/15 text-blue-100"
  if (normalized.includes("authorized")) return "border-blue-500/50 bg-blue-950/40 text-blue-100"

  return "border-neutral-700 bg-neutral-950 text-neutral-300"
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
  className,
}: VouchCardProps) {
  return (
    <Card className={cn("group bg-black/80 transition-transform hover:-translate-y-0.5", className)}>
      <CardContent className="grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-neutral-500 uppercase">{id}</p>
            <h3 className="mt-2 truncate font-(family-name:--font-display) text-4xl leading-none tracking-[0.03em] text-white uppercase">
              {title}
            </h3>
          </div>
          <Badge className={cn("shrink-0", statusTone(statusLabel))}>{statusLabel}</Badge>
        </div>

        <div className="grid grid-cols-3 border border-neutral-800">
          <div className="border-r border-neutral-800 p-3">
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
              {labels.role}
            </p>
            <p className="mt-2 text-sm font-bold text-neutral-100 capitalize">{role}</p>
          </div>
          <div className="border-r border-neutral-800 p-3">
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
              {labels.amount}
            </p>
            <p className="mt-2 text-sm font-bold text-neutral-100">{amountLabel}</p>
          </div>
          <div className="p-3">
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
              {labels.deadline}
            </p>
            <p className="mt-2 text-sm font-bold text-neutral-100">{deadlineLabel}</p>
          </div>
        </div>

        <Button variant="secondary" className="w-full justify-between" render={<Link href={href} />}>
          {nextActionLabel}
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
