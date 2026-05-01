// components/marketing/metric-grid.tsx

const metrics = [
  {
    label: "Dual confirmation",
    value: "100%",
    body: "Funds release only when both parties confirm.",
  },
  {
    label: "No-show protection",
    value: "24/7",
    body: "If it falls through, you’re covered.",
  },
  {
    label: "Clear and simple",
    value: "4 steps",
    body: "Create, accept, confirm, release. That’s it.",
  },
  {
    label: "Not an escrow",
    value: "0%",
    body: "Vouch coordinates. Providers process.",
  },
]

export function MetricGrid() {
  return (
    <section className="mt-14 grid border border-neutral-700 bg-black/55 backdrop-blur-[2px] sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0 sm:nth-[2n-1]:border-r lg:border-r lg:border-b-0 lg:last:border-r-0"
        >
          <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.07em] text-white uppercase">
            {metric.label}
          </p>
          <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
            {metric.value}
          </p>
          <p className="mt-3 max-w-52.5 text-[15px] leading-[1.22] font-semibold text-neutral-300">
            {metric.body}
          </p>
        </div>
      ))}
    </section>
  )
}
