import type { ReactNode } from "react"

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
    <header className={cn("max-w-170", className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="bg-primary size-2.5 shrink-0" />
          <p className="vouch-label text-sm leading-none text-white sm:text-base lg:text-lg">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <h1
        className={cn(
          "max-w-full text-[44px] leading-[0.86] break-words text-white sm:text-[76px] sm:break-normal lg:text-[82px] xl:text-[86px]",
          eyebrow ? "mt-6" : undefined,
          titleClassName
        )}
      >
        {title}
      </h1>

      {body ? (
        <p
          className={cn(
            "mt-7 max-w-140 text-[18px] leading-[1.35] font-semibold text-neutral-300",
            bodyClassName
          )}
        >
          {body}
        </p>
      ) : null}

      {actions ? <div className="mt-8 flex flex-col gap-4 sm:flex-row">{actions}</div> : null}
    </header>
  )
}
