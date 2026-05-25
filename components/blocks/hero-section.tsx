import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, Star, Zap } from "lucide-react"

// ============================================================================
// HERO VARIANT 1: Centered with Badge
// ============================================================================
export interface HeroCenteredProps {
  badge?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}

export function HeroCentered({
  badge,
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
}: HeroCenteredProps) {
  return (
    <section className="px-4 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        {badge && (
          <Badge variant="outline" className="px-4 py-1 text-sm">
            <Sparkles className="mr-2 h-3 w-3" />
            {badge}
          </Badge>
        )}

        <h2 className="text-4xl leading-snug font-black uppercase md:text-5xl lg:text-6xl">
          {title}{" "}
          {titleHighlight && <span className="bg-blue-600 px-2 text-white">{titleHighlight}</span>}
        </h2>

        <p className="mx-auto max-w-2xl text-lg font-medium text-neutral-400 md:text-xl">
          {description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {primaryAction &&
              (primaryAction.href ? (
                <Button size="lg" asChild>
                  <a href={primaryAction.href}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <Button size="lg" variant="outline" asChild>
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================================================
// HERO VARIANT 2: Split with Image
// ============================================================================
export interface HeroSplitProps {
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  imageSrc: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}

export function HeroSplit({
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt = "Hero image",
  imagePosition = "right",
}: HeroSplitProps) {
  const contentOrder = imagePosition === "right" ? "order-1" : "order-2"
  const imageOrder = imagePosition === "right" ? "order-2" : "order-1"

  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className={`space-y-6 ${contentOrder}`}>
          <h2 className="text-4xl font-black uppercase md:text-5xl">
            {title}{" "}
            {titleHighlight && (
              <span className="bg-blue-600 px-2 text-white">{titleHighlight}</span>
            )}
          </h2>

          <p className="text-lg font-medium text-neutral-400">{description}</p>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col gap-4 sm:flex-row">
              {primaryAction &&
                (primaryAction.href ? (
                  <Button size="lg" asChild>
                    <a href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" onClick={primaryAction.onClick}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ))}
              {secondaryAction &&
                (secondaryAction.href ? (
                  <Button size="lg" variant="outline" asChild>
                    <a href={secondaryAction.href}>
                      <Play className="mr-2 h-4 w-4" />
                      {secondaryAction.label}
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                    <Play className="mr-2 h-4 w-4" />
                    {secondaryAction.label}
                  </Button>
                ))}
            </div>
          )}
        </div>

        <div className={`relative ${imageOrder}`}>
          <div className="overflow-hidden border-3 border-neutral-400 shadow-[4px_4px_0px_black]">
            <span
              aria-label={imageAlt}
              role="img"
              className="block min-h-80 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// HERO VARIANT 3: With Stats
// ============================================================================
export interface HeroWithStatsProps {
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  stats: Array<{ value: string; label: string }>
}

export function HeroWithStats({
  title,
  titleHighlight,
  description,
  primaryAction,
  stats,
}: HeroWithStatsProps) {
  return (
    <section className="px-4 py-20 md:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 space-y-6 text-center">
          <h2 className="text-4xl font-black uppercase md:text-5xl lg:text-6xl">
            {title}{" "}
            {titleHighlight && (
              <span className="bg-neutral-900 px-2 text-white">{titleHighlight}</span>
            )}
          </h2>

          <p className="mx-auto max-w-2xl text-lg font-medium text-neutral-400 md:text-xl">
            {description}
          </p>

          {primaryAction &&
            (primaryAction.href ? (
              <Button size="lg" asChild>
                <a href={primaryAction.href}>
                  {primaryAction.label}
                  <Zap className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`stat-${stat.label}`}
              className="border-3 border-neutral-400 bg-black p-6 text-center shadow-[4px_4px_0px_black]"
            >
              <div className="text-3xl font-black md:text-4xl">{stat.value}</div>
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
// HERO VARIANT 4: Minimal
// ============================================================================
export interface HeroMinimalProps {
  title: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
}

export function HeroMinimal({ title, description, primaryAction }: HeroMinimalProps) {
  return (
    <section className="px-4 py-32 md:px-8 lg:px-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-5xl leading-none font-black uppercase md:text-6xl lg:text-7xl">
          {title}
        </h2>

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-lg font-medium text-neutral-400">{description}</p>

          {primaryAction &&
            (primaryAction.href ? (
              <Button size="lg" className="shrink-0" asChild>
                <a href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" className="shrink-0" onClick={primaryAction.onClick}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ))}
        </div>

        <div className="h-1 w-full bg-white" />
      </div>
    </section>
  )
}

// ============================================================================
// HERO VARIANT 5: With Video
// ============================================================================
export interface HeroWithVideoProps {
  badge?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  videoThumbnail: string
  onPlayClick?: () => void
}

export function HeroWithVideo({
  badge,
  title,
  titleHighlight,
  description,
  primaryAction,
  videoThumbnail,
  onPlayClick,
}: HeroWithVideoProps) {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-6 text-center">
          {badge && (
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              <Star className="mr-2 h-3 w-3" />
              {badge}
            </Badge>
          )}

          <h2 className="text-4xl font-black uppercase md:text-5xl">
            {title}{" "}
            {titleHighlight && (
              <span className="underline decoration-blue-600 decoration-4 underline-offset-4">
                {titleHighlight}
              </span>
            )}
          </h2>

          <p className="mx-auto max-w-2xl text-lg font-medium text-neutral-400">{description}</p>

          {primaryAction &&
            (primaryAction.href ? (
              <Button size="lg" asChild>
                <a href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ))}
        </div>

        <div className="group relative cursor-pointer" onClick={onPlayClick}>
          <div className="overflow-hidden border-3 border-neutral-400 shadow-[4px_4px_0px_black]">
            <span
              aria-label="Video thumbnail"
              role="img"
              className="block aspect-video w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${videoThumbnail})` }}
            />
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 transition-colors group-hover:bg-neutral-400/80">
            <div className="flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_black] transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_black]">
              <Play className="h-8 w-8 fill-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const HeroSection = {
  Centered: HeroCentered,
  Split: HeroSplit,
  WithStats: HeroWithStats,
  Minimal: HeroMinimal,
  WithVideo: HeroWithVideo,
}
