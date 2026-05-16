import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricGridItem { label: string; value: string; body: string }

export function MetricGrid({ items, className }: { items: MetricGridItem[]; className?: string }) {
  return (
    <section className={cn("grid gap-0 border border-neutral-700 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((metric) => (
        <Card key={`${metric.label}-${metric.value}`} className="rounded-none border-0 border-neutral-700 bg-black/80 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{metric.label}</p>
            <p className="mt-3 text-4xl font-semibold uppercase tracking-tight text-white">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-neutral-400">{metric.body}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
