type StatItem = {
  label: string
  value: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  body?: string
}

type StatsSplitProps = {
  subtitle?: string
  title: string
  description?: string
  stats: StatItem[]
  contentPosition?: "left" | "right"
}

import { CheckSquare } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingMotion =
  "block w-fit transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function StatsSplit({
  subtitle,
  title,
  description,
  stats,
  contentPosition = "left",
}: StatsSplitProps) {
  return (
    <section>
      {subtitle && (
        <div
          className={
            contentPosition === "right"
              ? "grid items-center gap-8 md:grid-cols-2 md:[&>*:first-child]:order-2"
              : "grid items-center gap-8 md:grid-cols-2"
          }
        >
          <div className="space-y-8">
            <p
              className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion}`}
            >
              {subtitle}
            </p>
            <div className={`text-7xl font-black uppercase ${headingMotion}`}>{title}</div>
            <p className={`text-lg font-medium text-neutral-400 ${bodyTextMotion}`}>
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <Card key={`stat-${stat.label}`} className={cardMotion}>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 border-b-3 border-neutral-400 pb-3">
                    <CheckSquare className="h-8 w-8" />

                    <h3 className="text-blue-600 uppercase">{stat.label}</h3>
                  </div>
                  <p className="text-sm">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
