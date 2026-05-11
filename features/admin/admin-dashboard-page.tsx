import Link from "next/link"

import { MetricGrid, type MetricGridItem } from "@/components/shared/metric-grid"
import { SectionIntro } from "@/components/shared/section-intro"

export type AdminMetric = {
  label: string
  value: string | number
  href?: string
  description?: string
}

type AdminDashboardPageProps = { metrics: AdminMetric[] }

export function AdminDashboardPage({ metrics }: AdminDashboardPageProps) {
  const metricItems: MetricGridItem[] = metrics.map((metric) => ({
    label: metric.label,
    value: String(metric.value),
    body: metric.description ?? "Operational inspection record.",
  }))

  return (
    <main className="flex w-full flex-col gap-6">
      <SectionIntro
        eyebrow="Operations"
        title="Admin"
        body="Operational inspection only. Admins do not arbitrate funds."
      />
      <MetricGrid items={metricItems} />
      <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics
          .filter((metric) => metric.href)
          .map((metric) => (
            <Link
              key={metric.label}
              href={metric.href as string}
              className="border border-neutral-800 bg-black/55 p-4 font-(family-name:--font-display) text-[18px] leading-none tracking-[0.08em] text-white uppercase transition hover:border-blue-700"
            >
              Open {metric.label}
            </Link>
          ))}
      </nav>
    </main>
  )
}
