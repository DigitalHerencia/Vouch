import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/status/empty-state"
import { Card } from "@/components/ui/card"
import { VouchCard, type VouchCardProps } from "@/components/vouches/vouch-card"
import { cn } from "@/lib/utils"

export interface VouchCardListProps {
  title: string
  description?: string | undefined
  emptyText: string
  icon?: LucideIcon | undefined
  rows: VouchCardProps[]
  labels: {
    eyebrow: string
    emptyEyebrow: string
  }
  className?: string | undefined
}

export function VouchCardList({
  title,
  description,
  emptyText,
  icon: Icon,
  rows,
  labels,
  className,
}: VouchCardListProps) {
  return (
    <section className={cn("grid gap-4", className)}>
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-primary font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] uppercase">
            {labels.eyebrow}
          </p>
          <h2 className="mt-2 font-(family-name:--font-display) text-4xl leading-none tracking-[0.03em] text-white uppercase">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 font-bold text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>
        {Icon ? <Icon className="size-8 text-white" strokeWidth={1.7} /> : null}
      </Card>

      {rows.length > 0 ? (
        <div className="grid gap-4">
          {rows.map((row) => (
            <VouchCard key={row.id} {...row} />
          ))}
        </div>
      ) : (
        <EmptyState eyebrow={labels.emptyEyebrow} title={emptyText} />
      )}
    </section>
  )
}
