import { Button } from "@/components/ui/button"
import { Zap, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingWordMotion =
  "block w-fit transition-all duration-300 [-webkit-text-stroke:4px_oklch(25.5%_0_0)] text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const panelMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

// ============================================================================
// HERO VARIANT 1: Centered
// ============================================================================
export interface HeroCenteredProps {
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}

export function HeroCentered({
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
}: HeroCenteredProps) {
  return (
    <section>
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-center leading-tight font-black uppercase">
          {title}{" "}
          {titleHighlight && <span className="bg-blue-600 px-2 text-white">{titleHighlight}</span>}
        </h1>

        <p className="mx-auto text-center text-lg font-medium text-neutral-400 md:text-xl">
          {description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="flex justify-items-center gap-4">
            {primaryAction &&
              (primaryAction.href ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
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
                    <a href={primaryAction.href}>{primaryAction.label}</a>
                  </Button>
                ) : (
                  <Button size="lg" onClick={primaryAction.onClick}>
                    {primaryAction.label}
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

        <div className={`relative ${imageOrder}`}>
          <div className="overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
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
// HERO VARIANT 2 Duplicate: Split with Process Panel
// ============================================================================
export interface HeroSplitPanelProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }

  panelTitle: string
  panelSteps: readonly {
    number: string
    title: string
    body: string
    icon: LucideIcon
  }[]
  panelFooter?: string | undefined
  panelId?: string | undefined

  panelPosition?: "left" | "right"
}

export function HeroSplitPanel({
  eyebrow,
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
  panelTitle,
  panelSteps,
  panelFooter,
  panelId,
  panelPosition = "right",
}: HeroSplitPanelProps) {
  const contentOrder = panelPosition === "right" ? "order-1" : "order-2"
  const panelOrder = panelPosition === "right" ? "order-2" : "order-1"
  const titleWords = title.split(" ")

  return (
    <section className="px-4 py-12 md:px-8 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-stretch">
        <div className={`flex min-h-full flex-col justify-between ${contentOrder}`}>
          <div className="space-y-16">
            <div className="space-y-8">
              {eyebrow ? (
                <p
                  className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion}`}
                >
                  {eyebrow}
                </p>
              ) : null}

              <h1 className="group text-6xl font-black text-white uppercase md:text-[96px]">
                {titleWords.map((word, i) => {
                  const isHighlighted = word === titleHighlight

                  return (
                    <span
                      key={`${word}-${i}`}
                      className={[
                        headingWordMotion,
                        isHighlighted
                          ? "border-3 border-neutral-200 bg-blue-600 px-2 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] group-hover:shadow-[10px_10px_0px_oklch(54.6%_0.245_262.881)]"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ transitionDelay: `${i * 75}ms` }}
                    >
                      {word}
                    </span>
                  )
                })}
              </h1>

              <p
                className={`max-w-xl text-lg font-medium text-neutral-400 md:text-xl ${bodyTextMotion}`}
              >
                {description}
              </p>
            </div>
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col gap-4 sm:flex-row">
                {primaryAction &&
                  (primaryAction.href ? (
                    <Button size="lg" asChild>
                      <a href={primaryAction.href}>{primaryAction.label}</a>
                    </Button>
                  ) : (
                    <Button size="lg" onClick={primaryAction.onClick}>
                      {primaryAction.label}
                    </Button>
                  ))}
                {secondaryAction &&
                  (secondaryAction.href ? (
                    <Button size="lg" variant="outline" asChild>
                      <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                      {secondaryAction.label}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </div>
        <Card
          id={panelId}
          className={`flex min-h-full w-full flex-col border-3 border-neutral-400 bg-black ${panelMotion} ${panelOrder}`}
        >
          <CardHeader className="items-center border-b-3 border-neutral-400 px-6 py-6 text-center md:px-8">
            <CardTitle className="text-6xl leading-none font-black tracking-wide text-white">
              {panelTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            {panelSteps.map((step) => {
              const Icon = step.icon

              return (
                <section
                  key={`${step.number}-${step.title}`}
                  className="border-b-3 border-neutral-400 last:border-b-0"
                >
                  <div className="grid min-h-31 min-w-0 grid-cols-[minmax(0,1fr)_7rem] md:min-h-34 md:grid-cols-[minmax(0,1fr)_140px]">
                    <div className="flex min-w-0 items-center gap-4 px-4 py-5 md:gap-6 md:px-7">
                      <div className="flex size-18 shrink-0 items-center justify-center border-3 border-neutral-400 md:size-22">
                        <h2 className="font-extrabold">{step.number}</h2>
                      </div>

                      <div>
                        <h3 className="tracking-normal text-white">{step.title}</h3>
                        <p className="font-semibold text-neutral-400">{step.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center border-l-3 border-neutral-400">
                      <Icon className="size-14 text-white md:size-16" strokeWidth={1.8} />
                    </div>
                  </div>
                </section>
              )
            })}
          </CardContent>

          {panelFooter ? (
            <CardFooter className="justify-center bg-blue-600 px-6 py-6 text-center">
              <h3 className="font-black tracking-wide text-white">{panelFooter}</h3>
            </CardFooter>
          ) : null}
        </Card>
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
              className="border-3 border-neutral-400 bg-black p-6 text-center shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]"
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
                <a href={primaryAction.href}>{primaryAction.label}</a>
              </Button>
            ) : (
              <Button size="lg" className="shrink-0" onClick={primaryAction.onClick}>
                {primaryAction.label}
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
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  videoThumbnail: string
  onPlayClick?: () => void
}

export function HeroWithVideo({
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
                <a href={primaryAction.href}>{primaryAction.label}</a>
              </Button>
            ) : (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            ))}
        </div>

        <div className="group relative cursor-pointer" onClick={onPlayClick}>
          <div className="overflow-hidden border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
            <span
              aria-label="Video thumbnail"
              role="img"
              className="block aspect-video w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${videoThumbnail})` }}
            />
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 transition-colors group-hover:bg-neutral-400/80">
            <div className="flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"></div>
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
  SplitPanel: HeroSplitPanel,
  WithStats: HeroWithStats,
  Minimal: HeroMinimal,
  WithVideo: HeroWithVideo,
}
