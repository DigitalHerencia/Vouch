type StatItem = {
  label: string
  value: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  body?: string
}

type StatsInlineProps = { stats: StatItem[] }

type StatsWithIconsProps = { stats: StatItem[] }

import * as React from "react"

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
  Inline: StatsInline,
  WithIcons: StatsWithIcons,
}
