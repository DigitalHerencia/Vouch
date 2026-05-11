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
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-[#1D4ED8]" />
          <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <h2
        className={cn(
          "mt-6 max-w-7xl font-(family-name:--font-display) text-[48px] leading-[0.92] tracking-[0.02em] text-white uppercase sm:text-[64px]",
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
