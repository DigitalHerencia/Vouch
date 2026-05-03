// components/shared/metric-grid.tsx

import { cn } from "@/lib/utils"

export interface MetricGridItem {
    label: string
    value: string
    body: string
}

export interface MetricGridProps {
    items: MetricGridItem[]
    className?: string
    tileClassName?: string
}

function getMetricTileClassName(index: number, total: number) {
    if (total === 4) {
        return cn(
            "min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0",
            "sm:nth-[2n-1]:border-r",
            "lg:border-r lg:border-b-0 lg:last:border-r-0",
        )
    }

    return cn(
        "min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0",
        index < total - 1 ? "lg:border-r lg:border-b-0" : undefined,
    )
}

export function MetricGrid({
    items,
    className,
    tileClassName,
}: MetricGridProps) {
    return (
        <section
            className={cn(
                "grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
                items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3",
                className,
            )}
        >
            {items.map((metric, index) => (
                <MetricTile
                    key={`${metric.label}-${metric.value}`}
                    metric={metric}
                    className={cn(
                        getMetricTileClassName(index, items.length),
                        tileClassName,
                    )}
                />
            ))}
        </section>
    )
}

export function MetricTile({
    metric,
    className,
}: {
    metric: MetricGridItem
    className?: string
}) {
    return (
        <article className={className}>
            <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.07em] text-white uppercase">
                {metric.label}
            </p>
            <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
                {metric.value}
            </p>
            <p className="mt-3 max-w-52.5 text-[15px] leading-[1.22] font-semibold text-neutral-300">
                {metric.body}
            </p>
        </article>
    )
}

export { MetricGrid as BrutalistMetricGrid }
