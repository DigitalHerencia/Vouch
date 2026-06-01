import { Button } from "@/components/ui/button"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const headingWordMotion =
  "block w-fit transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"
const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const panelMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function HeroCentered({
  eyebrow,
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
  align = "center",
}: HeroCenteredProps) {
  const isLeftAligned = align === "left"

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div
          className={`flex flex-col space-y-8 ${isLeftAligned ? "items-start" : "items-center"}`}
        >
          {eyebrow ? (
            <p
              className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion}`}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={`leading-tight font-black uppercase ${isLeftAligned ? "text-left" : "text-center"}`}
          >
            {title}{" "}
            {titleHighlight && (
              <span className="bg-blue-600 px-2 text-white">{titleHighlight}</span>
            )}
          </h1>

          {description ? (
            <p
              className={`text-lg font-medium text-neutral-400 md:text-xl ${isLeftAligned ? "text-left" : "mx-auto text-center"}`}
            >
              {description}
            </p>
          ) : null}

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
    </main>
  )
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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
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
    </main>
  )
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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className={`flex min-h-full flex-col justify-between ${contentOrder}`}>
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
            <CardHeader className="items-center border-b-3 border-neutral-400 px-5 py-4 text-center md:px-6">
              <CardTitle className="text-4xl leading-none font-black tracking-wide text-white md:text-5xl">
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
                    <div className="grid min-h-24 min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] md:min-h-27 md:grid-cols-[minmax(0,1fr)_112px]">
                      <div className="flex min-w-0 items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
                        <div className="flex size-14 shrink-0 items-center justify-center border-3 border-neutral-400 md:size-16">
                          <h2 className="text-2xl font-extrabold md:text-3xl">{step.number}</h2>
                        </div>

                        <div>
                          <h3 className="text-xl tracking-normal text-white md:text-2xl">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-tight font-semibold text-neutral-400 md:text-base">
                            {step.body}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center border-l-3 border-neutral-400">
                        <Icon className="size-10 text-white md:size-12" strokeWidth={1.8} />
                      </div>
                    </div>
                  </section>
                )
              })}
            </CardContent>

            {panelFooter ? (
              <CardFooter className="justify-center bg-blue-600 px-5 py-4 text-center">
                <h3 className="text-xl font-black tracking-wide text-white md:text-2xl">
                  {panelFooter}
                </h3>
              </CardFooter>
            ) : null}
          </Card>
        </div>
      </section>
    </main>
  )
}

export function HeroWithStats({
  subtitle,
  title,
  titleHighlight,
  description,
  stats,
  align = "center",
}: HeroWithStatsProps) {
  const isLeftAligned = align === "left"

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className={`mb-12 space-y-8 ${isLeftAligned ? "text-left" : "text-center"}`}>
          {subtitle ? (
            <p
              className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] ${subtitleMotion} ${isLeftAligned ? "" : "mx-auto"}`}
            >
              {subtitle}
            </p>
          ) : null}

          <h2
            className={`group flex flex-wrap gap-x-4 leading-tight font-black uppercase ${
              isLeftAligned ? "justify-start" : "justify-center"
            }`}
          >
            {title.split(" ").map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={headingWordMotion}
                style={{ transitionDelay: `${i * 75}ms` }}
              >
                {word}
              </span>
            ))}
            {titleHighlight && (
              <span className="border-3 border-neutral-200 bg-blue-600 px-2 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[10px_10px_0px_oklch(54.6%_0.245_262.881)]">
                {titleHighlight}
              </span>
            )}
          </h2>

          <p
            className={`max-w-4xl text-lg font-medium text-neutral-400 md:text-xl ${bodyTextMotion} ${isLeftAligned ? "" : "mx-auto"}`}
          >
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`stat-${stat.label}`}
              className="border-3 border-neutral-400 bg-black p-6 text-left shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"
            >
              <div className="flex items-center gap-2 border-b-3 border-neutral-400 pb-3">
                <div className="border-2 border-neutral-400 px-4 py-2 text-3xl font-black text-white md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-lg leading-tight font-bold text-blue-600 uppercase">
                  {stat.label}
                </div>
              </div>
              {stat.body ? (
                <p className="mt-3 text-sm font-medium text-white">{stat.body}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export function HeroMinimal({ title, description, primaryAction }: HeroMinimalProps) {
  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="space-y-8">
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
    </main>
  )
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
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="space-y-12">
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
    </main>
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
