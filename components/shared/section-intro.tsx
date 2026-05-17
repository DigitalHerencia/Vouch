import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SectionIntro({
  eyebrow,
  title,
  body,
  actions,
  className,
  titleClassName,
  bodyClassName,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {eyebrow ? (
        <p className="flex items-center gap-3 font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-primary uppercase">
          <span className="size-2 bg-primary" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "max-w-5xl font-(family-name:--font-display) text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] tracking-[0.02em] text-white uppercase",
          titleClassName
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 font-semibold text-neutral-400",
            bodyClassName
          )}
        >
          {body}
        </p>
      ) : null}
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </section>
  )
}
