import type { ReactNode } from "react"

import { ActionRow } from "@/components/shared/action-row"
import { cn } from "@/lib/utils"

export interface SectionIntroProps {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
  bodyClassName?: string
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  actions,
  className,
  titleClassName,
  bodyClassName,
}: SectionIntroProps) {
  return (
    <section className={cn("max-w-7xl.5", className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-primary" />
          <p className="vouch-label text-[15px] leading-none text-white">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <h2
        className={cn(
          "mt-6 max-w-7xl text-[48px] leading-[0.92] text-white sm:text-[64px]",
          !eyebrow ? "mt-0" : undefined,
          titleClassName,
        )}
      >
        {title}
      </h2>

      {body ? (
        <p
          className={cn(
            "mt-4 max-w-7xl text-[17px] leading-[1.35] font-semibold text-neutral-400",
            bodyClassName,
          )}
        >
          {body}
        </p>
      ) : null}

      {actions ? <ActionRow>{actions}</ActionRow> : null}
    </section>
  )
}
