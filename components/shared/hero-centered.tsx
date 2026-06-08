// components/shared/hero-centered.tsx

import Link from "next/link"

import { Button } from "@/components/ui/button"

type HeroAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type HeroCenteredProps = {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  align?: "left" | "center"
}

const eyebrowMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"

const headingWordMotion =
  "inline-block transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-shadow-[7px_7px_0px_oklch(54.6%_0.245_262.881)]"

const bodyTextMotion =
  "transition-all duration-200 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[4px_4px_4px_oklch(54.6%_0.245_262.881)]"

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
  const titleWords = title.split(" ")

  return (
    <section>
      <div
        className={[
          "flex flex-col gap-6",
          isLeftAligned ? "items-start text-left" : "mx-auto items-center text-center",
        ].join(" ")}
      >
        {eyebrow ? (
          <p
            className={[
              "w-fit border-2 border-neutral-400 bg-black px-3 py-1 text-[11px] leading-none font-black tracking-[0.22em] text-white uppercase shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] md:text-xs",
              eyebrowMotion,
            ].join(" ")}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={[
            "group text-5xl font-black tracking-tight text-white uppercase md:text-7xl lg:text-8xl",
            isLeftAligned ? "text-left" : "text-center",
          ].join(" ")}
        >
          {titleWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={headingWordMotion}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              {word}
              {index < titleWords.length - 1 ? "\u00A0" : ""}
            </span>
          ))}

          {titleHighlight ? (
            <>
              {" "}
              <span className="inline-block border-3 border-neutral-200 bg-blue-600 px-2 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[10px_10px_0px_oklch(54.6%_0.245_262.881)]">
                {titleHighlight}
              </span>
            </>
          ) : null}
        </h1>

        {description ? (
          <p
            className={[
              "text-sm font-semibold text-neutral-300 md:text-base",
              isLeftAligned ? "text-left" : "mx-auto text-center",
              bodyTextMotion,
            ].join(" ")}
          >
            {description}
          </p>
        ) : null}

        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            {primaryAction ? (
              primaryAction.href ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href={primaryAction.href}>{primaryAction.label}</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )
            ) : null}

            {secondaryAction ? (
              secondaryAction.href ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
