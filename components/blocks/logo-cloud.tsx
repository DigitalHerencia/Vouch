import * as React from "react"
import { cn, safeHref } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"

export interface LogoItem {
  name: string
  logo: string | React.ReactNode
  url?: string
}

// ============================================================================
// LOGO CLOUD VARIANT 1: Simple Grid
// ============================================================================
export interface LogoCloudGridProps {
  title?: string
  subtitle?: string
  logos: LogoItem[]
  columns?: 3 | 4 | 5 | 6
  className?: string
}

export function LogoCloudGrid({
  title,
  subtitle,
  logos,
  columns = 5,
  className,
}: LogoCloudGridProps) {
  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-6",
  }

  return (
    <section className={cn("px-4 py-12 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-8 space-y-2 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-xl font-black tracking-tight uppercase md:text-2xl">{title}</h2>
            )}
          </div>
        )}

        <div className={cn("grid items-center gap-8", gridCols[columns])}>
          {logos.map((logo) => (
            <LogoCloudItem key={`logo-${logo.name}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// LOGO CLOUD VARIANT 2: With Marquee
// ============================================================================
export interface LogoCloudMarqueeProps {
  title?: string
  logos: LogoItem[]
  speed?: "slow" | "normal" | "fast"
  direction?: "left" | "right"
  className?: string
}

export function LogoCloudMarquee({
  title,
  logos,
  speed = "normal",
  direction = "left",
  className,
}: LogoCloudMarqueeProps) {
  return (
    <section className={cn("overflow-hidden px-4 py-12 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {title && (
          <p className="mb-8 text-center text-sm font-bold tracking-widest text-muted-foreground uppercase">
            {title}
          </p>
        )}

        <Marquee className="py-4" direction={direction} speed={speed}>
          {logos.map((logo) => (
            <div
              key={`logo-marquee-${logo.name}`}
              className="mx-8 flex h-12 items-center justify-center opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0"
            >
              {typeof logo.logo === "string" ? (
                <img src={logo.logo} alt={logo.name} className="h-full w-auto object-contain" />
              ) : (
                logo.logo
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

// ============================================================================
// LOGO CLOUD VARIANT 3: Bordered Cards
// ============================================================================
export interface LogoCloudCardsProps {
  title?: string
  subtitle?: string
  logos: LogoItem[]
  className?: string
}

export function LogoCloudCards({ title, subtitle, logos, className }: LogoCloudCardsProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-10 space-y-2 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-primary uppercase">{subtitle}</p>
            )}
            {title && (
              <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">{title}</h2>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {logos.map((logo) => {
            const inner = (
              <div className="flex h-24 cursor-pointer items-center justify-center border-3 border-foreground bg-card p-6 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_hsl(var(--shadow-color))]">
                {typeof logo.logo === "string" ? (
                  <img src={logo.logo} alt={logo.name} className="h-10 w-auto object-contain" />
                ) : (
                  logo.logo
                )}
              </div>
            )
            return logo.url ? (
              <a
                key={`logo-${logo.name}`}
                href={safeHref(logo.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <React.Fragment key={`logo-${logo.name}`}>{inner}</React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// LOGO CLOUD VARIANT 4: With Stats
// ============================================================================
export interface LogoCloudWithStatsProps {
  title?: string
  logos: LogoItem[]
  stats: Array<{ value: string; label: string }>
  className?: string
}

export function LogoCloudWithStats({ title, logos, stats, className }: LogoCloudWithStatsProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {title && (
              <h2 className="text-2xl font-black tracking-tight uppercase md:text-3xl">{title}</h2>
            )}

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={`stat-${stat.label}`}
                  className="border-3 border-foreground p-4 shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
                >
                  <div className="text-3xl font-black">{stat.value}</div>
                  <div className="text-sm font-bold text-muted-foreground uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {logos.slice(0, 9).map((logo) => {
              const inner = (
                <div className="flex h-16 items-center justify-center opacity-70 transition-opacity hover:opacity-100">
                  {typeof logo.logo === "string" ? (
                    <img
                      src={logo.logo}
                      alt={logo.name}
                      className="h-8 w-auto object-contain grayscale transition-all hover:grayscale-0"
                    />
                  ) : (
                    logo.logo
                  )}
                </div>
              )
              return logo.url ? (
                <a
                  key={`logo-${logo.name}`}
                  href={safeHref(logo.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  {inner}
                </a>
              ) : (
                <React.Fragment key={`logo-${logo.name}`}>{inner}</React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Helper Component
// ============================================================================
function LogoCloudItem({ logo }: { logo: LogoItem }) {
  const content = (
    <div className="flex h-12 items-center justify-center opacity-60 grayscale transition-opacity hover:opacity-100 hover:grayscale-0">
      {typeof logo.logo === "string" ? (
        <img src={logo.logo} alt={logo.name} className="h-full w-auto object-contain" />
      ) : (
        logo.logo
      )}
    </div>
  )

  if (logo.url) {
    return (
      <a href={safeHref(logo.url)} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}

// ============================================================================
// Export all variants
// ============================================================================
export const LogoCloud = {
  Grid: LogoCloudGrid,
  Marquee: LogoCloudMarquee,
  Cards: LogoCloudCards,
  WithStats: LogoCloudWithStats,
}
