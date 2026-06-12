type AuthAction = { label: string; href?: string; onClick?: () => void }

type HeroAction = AuthAction

type HeroCenteredProps = {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  align?: "left" | "center"
}

type HeroSplitPanelProps = HeroCenteredProps & {
  panelTitle: string
  panelSteps: Array<{
    number: string
    title: string
    body: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }>
  panelFooter?: string
  panelId?: string
  panelPosition?: "left" | "right"
}

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const subtitleMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-vouch-md"
const headingWordMotion =
  "block w-fit text-shadow-vouch-sm transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-vouch-md"
const bodyTextMotion =
  "text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"
const panelMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-vouch-xl"

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
    <section>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <div className={`flex min-h-full flex-col justify-between ${contentOrder}`}>
          <div className="space-y-8">
            {eyebrow ? (
              <p
                className={`w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-sm font-bold tracking-widest text-white uppercase shadow-vouch-sm ${subtitleMotion}`}
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
                        ? "border-3 border-neutral-200 bg-blue-600 px-2 text-white shadow-vouch-lg group-hover:shadow-[10px_10px_0px_oklch(54.6%_0.245_262.881)]"
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
                      <Link href={primaryAction.href}>{primaryAction.label}</Link>
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
  )
}
