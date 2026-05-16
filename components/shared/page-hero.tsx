import type { ReactNode } from "react"

import { ActionRow } from "@/components/shared/action-row"
import { cn } from "@/lib/utils"

export interface PageHeroProps {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
  bodyClassName?: string
}

export function PageHero({
  eyebrow,
  title,
  body,
  actions,
  className,
  titleClassName,
  bodyClassName,
}: PageHeroProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-primary" />
          <p className="vouch-label text-sm leading-none text-white sm:text-base">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <h1
        className={cn(
          "text-6xl leading-none text-white sm:text-7xl lg:text-8xl",
          eyebrow ? "mt-6" : undefined,
          titleClassName,
        )}
      >
        {title}
      </h1>

      {body ? (
        <p
          className={cn(
            "mt-7 max-w-2xl text-base leading-snug font-semibold text-neutral-300 sm:text-lg",
            bodyClassName,
          )}
        >
          {body}
        </p>
      ) : null}

      {actions ? <ActionRow>{actions}</ActionRow> : null}
    </header>
  )
}