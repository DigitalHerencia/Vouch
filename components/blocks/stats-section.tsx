import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface StatItem {
  value: string
  label: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

// ============================================================================
// STATS VARIANT 1: Simple Grid
// ============================================================================
export interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className={`mx-auto grid max-w-6xl gap-6 ${gridCols[columns]}`}>
        {stats.map((stat) => (
          <div key={`stat-${stat.label}`} className="space-y-2 text-center">
            <div className="text-4xl font-black md:text-5xl">{stat.value}</div>
            <div className="text-sm font-bold tracking-wide text-white uppercase">{stat.label}</div>
            {stat.description && <p className="text-sm text-neutral-400">{stat.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// STATS VARIANT 2: With Cards
// ============================================================================
export interface StatsCardsProps {
  title?: string
  subtitle?: string
  stats: StatItem[]
}

export function StatsCards({ title, subtitle, stats }: StatsCardsProps) {
  const cardColors = ["bg-black", "bg-black", "bg-black", "bg-black"]

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
                {subtitle}
              </p>
            )}
            {title && <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={`stat-${stat.label}`}
              className={`border-3 border-neutral-400 p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] ${
                cardColors[index % 4]
              }`}
            >
              <div className="text-3xl font-black md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm font-bold tracking-wide uppercase">{stat.label}</div>
              {stat.trend && (
                <div className="mt-2 flex items-center gap-1">
                  {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-blue-600" />}
                  {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {stat.trend === "neutral" && <Minus className="h-4 w-4 text-neutral-400" />}
                  {stat.trendValue && (
                    <span
                      className={`text-xs font-bold ${
                        stat.trend === "up"
                          ? "text-blue-600"
                          : stat.trend === "down"
                            ? "text-red-600"
                            : "text-neutral-400"
                      }`}
                    >
                      {stat.trendValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// STATS VARIANT 3: Split with Content
// ============================================================================
export interface StatsSplitProps {
  title: string
  description: string
  stats: StatItem[]
  contentPosition?: "left" | "right"
}

export function StatsSplit({
  title,
  description,
  stats,
  contentPosition = "left",
}: StatsSplitProps) {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div
        className={
          contentPosition === "right"
            ? "mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:[&>*:first-child]:order-2"
            : "mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2"
        }
      >
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>
          <p className="text-lg font-medium text-neutral-400">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={`stat-${stat.label}`}
              className="border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
            >
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="mt-1 text-sm font-bold tracking-wide text-neutral-400 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// STATS VARIANT 4: Inline
// ============================================================================
export interface StatsInlineProps {
  stats: StatItem[]
}

export function StatsInline({ stats }: StatsInlineProps) {
  return (
    <section className="border-y-3 border-neutral-400 bg-black px-4 py-8 md:px-8 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 md:gap-16">
        {stats.map((stat) => (
          <div key={`stat-${stat.label}`} className="text-center">
            <span className="text-3xl font-black md:text-4xl">{stat.value}</span>
            <span className="ml-2 text-sm font-bold tracking-wide text-white uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// STATS VARIANT 5: With Icons
// ============================================================================
export interface StatWithIconItem extends StatItem {
  icon: React.ReactNode
}

export interface StatsWithIconsProps {
  stats: StatWithIconItem[]
}

export function StatsWithIcons({ stats }: StatsWithIconsProps) {
  const iconColors = ["bg-black", "bg-black", "bg-black", "bg-black"]

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={`stat-${stat.label}`} className="space-y-4 text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] ${
                iconColors[index % 4]
              }`}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-black md:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm font-bold tracking-wide text-white uppercase">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const StatsSection = {
  Grid: StatsGrid,
  Cards: StatsCards,
  Split: StatsSplit,
  Inline: StatsInline,
  WithIcons: StatsWithIcons,
}
