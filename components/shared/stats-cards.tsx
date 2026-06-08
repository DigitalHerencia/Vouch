// components/shared/stats-cards.tsx

import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import type { DashboardStatItem } from "@/types/dashboardTypes"

export type StatsCardsProps = {
  title?: string
  subtitle?: string
  stats: DashboardStatItem[]
}

const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

function TrendIcon({ trend }: { trend: NonNullable<DashboardStatItem["trend"]> }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-blue-600" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />
  return <Minus className="h-4 w-4 text-neutral-400" />
}

function getTrendValueClassName(trend: DashboardStatItem["trend"]): string {
  if (trend === "up") return "text-blue-600"
  if (trend === "down") return "text-red-600"
  return "text-neutral-400"
}

export function StatsCards({ title, subtitle, stats }: StatsCardsProps) {
  return (
    <section className="px-4 py-8 md:px-8 lg:px-16" aria-label="Dashboard metrics">
      {title || subtitle ? (
        <div className="mb-7 space-y-2 text-center md:mb-8">
          {subtitle ? (
            <p className="text-xs font-black tracking-[0.22em] text-blue-600 uppercase md:text-sm">
              {subtitle}
            </p>
          ) : null}

          {title ? (
            <h2 className="text-3xl leading-none font-black tracking-tight text-white uppercase md:text-4xl">
              {title}
            </h2>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {stats.map((stat) => (
          <article
            key={`stat-${stat.label}`}
            className={[
              "flex min-h-26 flex-col justify-center border-3 border-neutral-400 bg-black p-5 shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)] md:min-h-28 md:p-6",
              cardMotion,
            ].join(" ")}
          >
            <div className="text-3xl leading-none font-black text-blue-600 md:text-4xl">
              {stat.value}
            </div>

            <div className="mt-3 text-sm leading-none font-black tracking-wider text-white uppercase md:text-base">
              {stat.label}
            </div>

            {stat.trend ? (
              <div className="mt-3 flex items-center gap-1.5">
                <TrendIcon trend={stat.trend} />

                {stat.trendValue ? (
                  <span className={`text-sm font-black ${getTrendValueClassName(stat.trend)}`}>
                    {stat.trendValue}
                  </span>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
