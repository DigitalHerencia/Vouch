// components/shared/page-title.tsx

import type { VouchFormPageTitleProps } from "@/types/vouchTypes"

const eyebrowMotion =
  "transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]"

const titleMotion =
  "transition-all duration-300 text-shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-shadow-[7px_7px_0px_oklch(54.6%_0.245_262.881)]"

export function PageTitle({ eyebrow, title, description }: VouchFormPageTitleProps) {
  return (
    <section className="px-4 py-8 md:px-8 lg:px-16">
      <div className="flex flex-col items-start gap-5">
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
            "max-w-4xl text-5xl leading-[0.9] font-black tracking-tight text-white uppercase md:text-7xl lg:text-8xl",
            titleMotion,
          ].join(" ")}
        >
          {title}
        </h1>

        {description ? (
          <p className="max-w-2xl text-sm leading-6 font-semibold text-neutral-300 text-shadow-[2px_2px_5px_oklch(54.6%_0.245_262.881)] md:text-base md:leading-7">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
