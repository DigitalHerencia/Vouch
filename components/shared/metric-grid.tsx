import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricGridItem { label: string; value: string; body: string }

export function MetricGrid({ items, className }: { items: MetricGridItem[]; className?: string }) {
  return (
    <section className={cn("grid gap-0 border border-neutral-700 bg-black shadow-[6px_6px_0_0_#1d4ed8] sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((metric) => (
        <Card key={`${metric.label}-${metric.value}`} className="rounded-none border-0 border-neutral-700 bg-black shadow-none sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
          <CardContent className="p-5 sm:p-6">
            <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-neutral-400 uppercase">{metric.label}</p>
            <p className="mt-4 font-(family-name:--font-display) text-5xl leading-none tracking-[0.02em] text-white uppercase">{metric.value}</p>
            <p className="mt-4 text-sm leading-5 font-bold text-neutral-300">{metric.body}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
