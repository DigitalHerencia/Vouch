// components/marketing/brutalist-page-header.tsx

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface BrutalistPageHeaderProps {
  eyebrow?: string
  title: ReactNode
  body: ReactNode
  actions?: ReactNode
  className?: string
}

export function BrutalistPageHeader({
  eyebrow,
  title,
  body,
  actions,
  className,
}: BrutalistPageHeaderProps) {
  return (
    <header className={cn("max-w-245", className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span className="size-3 bg-[#1D4ED8]" />
          <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <h1
        className={cn(
          "font-(family-name:--font-display) text-[62px] leading-[0.88] tracking-[0.015em] text-white uppercase sm:text-[86px] lg:text-[104px]",
          eyebrow ? "mt-6" : undefined
        )}
      >
        {title}
      </h1>

      <p className="mt-5 max-w-170 text-[18px] leading-[1.35] font-semibold text-neutral-400">
        {body}
      </p>

      {actions ? (
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">{actions}</div>
      ) : null}
    </header>
  )
}
