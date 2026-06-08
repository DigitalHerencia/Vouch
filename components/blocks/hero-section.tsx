import { Button } from "@/components/ui/button"
import Link from "next/link"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"

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
  Minimal: HeroMinimal,
  WithVideo: HeroWithVideo,
}
