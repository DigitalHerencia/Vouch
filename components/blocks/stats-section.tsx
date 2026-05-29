import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { stat } from "fs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingMotion =
  "transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const cardMotion =
  "group flex flex-col overflow-hidden bg-black transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {stats.map((stat) => (
            <div key={`stat-${stat.label}`} className="space-y-2 text-center">
              <div className="text-4xl font-black text-blue-600 md:text-5xl">{stat.value}</div>
              <div className="text-2xl font-bold tracking-wide text-white uppercase">
                {stat.label}
              </div>
              {stat.description && <p className="text-sm text-neutral-400">{stat.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div>
          {(title || subtitle) && (
            <div className="mb-12 space-y-2 text-center">
              {subtitle && (
                <p className="text-lg font-bold tracking-widest text-blue-600 uppercase">
                  {subtitle}
                </p>
              )}
              {title && <h2 className="font-black uppercase">{title}</h2>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={`stat-${stat.label}`}
                className={`border-3 border-neutral-400 p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)] ${
                  cardColors[index % 4]
                }`}
              >
                <div className="text-3xl font-black text-blue-600 md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-xl font-bold tracking-wide uppercase">{stat.label}</div>
                {stat.trend && (
                  <div className="mt-2 flex items-center gap-1">
                    {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                    {stat.trend === "neutral" && <Minus className="h-4 w-4 text-neutral-400" />}
                    {stat.trendValue && (
                      <span
                        className={`text-lg font-bold ${
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
    </main>
  )
}

// ============================================================================
// STATS VARIANT 3: Split with Content
// ============================================================================
export interface StatsSplitProps {
  subtitle?: string
  title: string
  description: string
  stats: StatItem[]
  contentPosition?: "left" | "right"
}

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
            <div className="space-y-6">
              <p
                className={`mb-6 inline-block border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-blue-600 uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion}`}
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
                    <div className="leading text-lg leading-tight text-blue-600 uppercase">
                      {stat.label}
                    </div>
                    <div className="text-sm">{stat.value}</div>
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

// ============================================================================
// STATS VARIANT 4: Inline
// ============================================================================
export interface StatsInlineProps {
  stats: StatItem[]
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
  Grid: StatsGrid,
  Cards: StatsCards,
  Split: StatsSplit,
  Inline: StatsInline,
  WithIcons: StatsWithIcons,
}
