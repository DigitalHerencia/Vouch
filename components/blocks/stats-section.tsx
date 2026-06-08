import * as React from "react"
import { CheckSquare } from "lucide-react"
import { Card, CardContent } from "../ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingMotion =
  "transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const cardMotion =
  "group flex flex-col overflow-hidden bg-black transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function StatsSplit({
  subtitle,
  title,
  description,
  stats,
  contentPosition = "left",
}: StatsSplitProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
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
    </main>
  )
}

export function StatsInline({ stats }: StatsInlineProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="flex flex-wrap justify-center gap-8 border-y-3 border-neutral-400 bg-black py-8 md:gap-16">
          {stats.map((stat) => (
            <div key={`stat-${stat.label}`} className="flex flex-col gap-2 text-center">
              <span className="text-5xl font-black text-blue-600 md:text-6xl">{stat.value}</span>
              <span className="ml-2 text-xl font-bold tracking-wide text-white uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export function StatsWithIcons({ stats }: StatsWithIconsProps) {
  const iconColors = ["bg-black", "bg-black", "bg-black", "bg-black"]

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={`stat-${stat.label}`} className="space-y-4 text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center border-3 border-neutral-400 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${
                  iconColors[index % 4]
                }`}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-5xl font-black md:text-6xl">{stat.value}</div>
                <div className="mt-2 text-xl font-bold tracking-wide text-blue-600 uppercase">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const StatsSection = {
  Split: StatsSplit,
  Inline: StatsInline,
  WithIcons: StatsWithIcons,
}
