import { Minus, TrendingDown, TrendingUp } from "lucide-react"

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
