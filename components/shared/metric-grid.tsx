export interface MetricGridItem {
  label: string
  value: string
  body: string
}

export interface MetricGridProps {
  items: readonly MetricGridItem[]
}

function getMetricTileClassName(index: number, total: number) {
  if (total === 4) {
    return "min-h-37.5 border-b border-neutral-400 p-6 last:border-b-0 sm:nth-[2n-1]:border-r lg:border-r lg:border-b-0 lg:last:border-r-0"
  }

  return index < total - 1
    ? "min-h-37.5 border-b border-neutral-400 p-6 last:border-b-0 lg:border-r lg:border-b-0"
    : "min-h-37.5 border-b border-neutral-400 p-6 last:border-b-0"
}

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <section
      className={
        items.length === 4
          ? "grid border border-neutral-400 bg-black backdrop-blur-[2px] sm:grid-cols-2 lg:grid-cols-4"
          : "grid border border-neutral-400 bg-black backdrop-blur-[2px] lg:grid-cols-3"
      }
    >
      {items.map((metric, index) => (
        <MetricTile
          key={`${metric.label}-${metric.value}`}
          metric={metric}
          tileClassName={getMetricTileClassName(index, items.length)}
        />
      ))}
    </section>
  )
}

function MetricTile({ metric, tileClassName }: { metric: MetricGridItem; tileClassName: string }) {
  return (
    <article className={tileClassName}>
      <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.07em] text-white uppercase">
        {metric.label}
      </p>
      <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
        {metric.value}
      </p>
      <p className="mt-3 max-w-52.5 text-[15px] leading-[1.22] font-semibold text-neutral-400">
        {metric.body}
      </p>
    </article>
  )
}
