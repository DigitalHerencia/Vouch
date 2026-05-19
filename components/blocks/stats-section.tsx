import * as React from "react"
import { cn } from "@/lib/utils"
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
  className?: string
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className={cn("mx-auto grid max-w-6xl gap-6", gridCols[columns])}>
        {stats.map((stat) => (
          <div key={`stat-${stat.label}`} className="space-y-2 text-center">
            <div className="text-4xl font-black md:text-5xl">{stat.value}</div>
            <div className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
              {stat.label}
            </div>
            {stat.description && (
              <p className="text-muted-foreground text-sm">{stat.description}</p>
            )}
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
  className?: string
}

export function StatsCards({ title, subtitle, stats, className }: StatsCardsProps) {
  const cardColors = ["bg-primary/10", "bg-secondary/10", "bg-accent/10", "bg-green-500/10"]

  return (
    <section className={cn("bg-muted/30 px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-2 text-center">
            {subtitle && (
              <p className="text-primary text-sm font-bold tracking-widest uppercase">{subtitle}</p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={`stat-${stat.label}`}
              className={cn(
                "border-foreground border-3 p-6 shadow-[4px_4px_0px_hsl(var(--shadow-color))] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]",
                cardColors[index % 4]
              )}
            >
              <div className="text-3xl font-black md:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm font-bold tracking-wide uppercase">{stat.label}</div>
              {stat.description && (
                <p className="text-muted-foreground mt-3 text-sm leading-6 font-medium">
                  {stat.description}
                </p>
              )}
              {stat.trend && (
                <div className="mt-2 flex items-center gap-1">
                  {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {stat.trend === "down" && <TrendingDown className="text-destructive h-4 w-4" />}
                  {stat.trend === "neutral" && <Minus className="text-muted-foreground h-4 w-4" />}
                  {stat.trendValue && (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        stat.trend === "up" && "text-green-600",
                        stat.trend === "down" && "text-destructive",
                        stat.trend === "neutral" && "text-muted-foreground"
                      )}
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
  className?: string
}

export function StatsSplit({
  title,
  description,
  stats,
  contentPosition = "left",
  className,
}: StatsSplitProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2",
          contentPosition === "right" && "md:[&>*:first-child]:order-2"
        )}
      >
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
          <p className="text-muted-foreground text-lg font-medium">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={`stat-${stat.label}`}
              className="border-foreground bg-card border-3 p-6 shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
            >
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-muted-foreground mt-1 text-sm font-bold tracking-wide uppercase">
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
  className?: string
}

export function StatsInline({ stats, className }: StatsInlineProps) {
  return (
    <section
      className={cn(
        "border-foreground bg-muted/30 border-y-3 px-4 py-8 md:px-8 lg:px-16",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 md:gap-16">
        {stats.map((stat) => (
          <div key={`stat-${stat.label}`} className="text-center">
            <span className="text-3xl font-black md:text-4xl">{stat.value}</span>
            <span className="text-muted-foreground ml-2 text-sm font-bold tracking-wide uppercase">
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
  className?: string
}

export function StatsWithIcons({ stats, className }: StatsWithIconsProps) {
  const iconColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-green-500"]

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={`stat-${stat.label}`} className="space-y-4 text-center">
            <div
              className={cn(
                "border-foreground mx-auto flex h-16 w-16 items-center justify-center border-3 shadow-[4px_4px_0px_hsl(var(--shadow-color))]",
                iconColors[index % 4]
              )}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-black md:text-4xl">{stat.value}</div>
              <div className="text-muted-foreground mt-1 text-sm font-bold tracking-wide uppercase">
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
