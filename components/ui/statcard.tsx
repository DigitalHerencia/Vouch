import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const statCardVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      default: "",
      compact: "[&_.stat-content]:p-4",
      large: "md:col-span-2",
    },
    colorScheme: {
      primary: "[&_.stat-bg]:bg-blue-600 [&_.stat-icon]:bg-blue-600",
      secondary: "[&_.stat-bg]:bg-neutral-900 [&_.stat-icon]:bg-neutral-900",
      accent: "[&_.stat-bg]:bg-blue-600 [&_.stat-icon]:bg-blue-600",
      success: "[&_.stat-bg]:bg-blue-600 [&_.stat-icon]:bg-blue-600",
      warning: "[&_.stat-bg]:bg-blue-600 [&_.stat-icon]:bg-blue-600",
      info: "[&_.stat-bg]:bg-blue-600 [&_.stat-icon]:bg-blue-600",
      destructive: "[&_.stat-bg]:bg-red-600 [&_.stat-icon]:bg-red-600",
    },
  },
  defaultVariants: {
    variant: "default",
    colorScheme: "primary",
  },
})

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      colorScheme,
      color,
      title,
      value,
      change,
      trend = "neutral",
      icon,
      progress,
      comparison = "vs last month",
      ...props
    },
    ref
  ) => {
    // Support legacy color prop
    const resolvedColorScheme = colorScheme ?? color ?? "primary"

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
    const trendColor =
      trend === "up" ? "text-blue-600" : trend === "down" ? "text-red-600" : "text-neutral-400"

    return (
      <Card
        ref={ref}
        className={cn(statCardVariants({ variant, colorScheme: resolvedColorScheme }), className)}
        {...props}
      >
        {/* Decorative background element */}
        <div className="stat-bg absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rotate-12 opacity-20" />

        <CardContent className="stat-content p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-bold tracking-wide text-neutral-400 uppercase">
                {title}
              </p>
              <p className="text-3xl font-black">{value}</p>
              {change && (
                <div className={cn("mt-2 flex items-center gap-1", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">{change}</span>
                  <span className="text-sm text-neutral-400">{comparison}</span>
                </div>
              )}
            </div>
            {icon && (
              <div className="stat-icon flex h-12 w-12 items-center justify-center border-3 border-neutral-400 text-white shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)]">
                {icon}
              </div>
            )}
          </div>

          {/* Progress section */}
          {progress && (
            <div className="mt-4 border-t-2 border-neutral-400 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-neutral-400">{progress.label || "Progress"}</span>
                <span className="font-bold">{progress.value}%</span>
              </div>
              <Progress value={progress.value} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard, statCardVariants }
