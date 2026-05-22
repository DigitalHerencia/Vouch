import type { LucideIcon } from "lucide-react"

import { InvoiceBlocks } from "@/components/blocks/invoice"
import { EmptyStatePreset } from "@/components/ui/empty-state"
import { Card } from "@/components/ui/card"
import type { VouchCardProps } from "@/components/vouches/vouch-card"

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
}

export function VouchCardList({
  title,
  description,
  emptyText,
  icon: Icon,
  rows,
  labels,
}: VouchCardListProps) {
  return (
    <section className="grid gap-4">
      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-blue-600 uppercase">
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
        <InvoiceBlocks.List
          invoices={rows.map((row) => ({
            id: row.id,
            invoiceNumber: row.title,
            clientName: row.role,
            date: row.deadlineLabel,
            amount: 0,
            status: "pending",
          }))}
        />
      ) : (
        <EmptyStatePreset
          preset="no-data"
          customTitle={labels.emptyEyebrow}
          customDescription={emptyText}
          variant="card"
          className="bg-black"
        />
      )}
    </section>
  )
}
