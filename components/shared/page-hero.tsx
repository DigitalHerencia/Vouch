import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PageHero({
  eyebrow,
  title,
  body,
  actions,
  className,
  contentClassName,
  titleClassName,
  bodyClassName,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn("min-w-0 rounded-none border-0 bg-transparent shadow-none", className)}>
      <CardContent className={cn("space-y-6 p-0", contentClassName)}>
        {eyebrow ? (
          <p className="flex items-center gap-3 font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-neutral-100 uppercase">
            <span className="size-2 bg-primary" />
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "max-w-5xl font-(family-name:--font-brand) text-[clamp(3.5rem,9vw,7.75rem)] leading-[0.86] font-black tracking-normal text-white uppercase",
            titleClassName
          )}
        >
          {title}
        </h1>
        {body ? (
          <p
            className={cn(
              "max-w-2xl text-base leading-7 font-bold text-neutral-300 sm:text-lg",
              bodyClassName
            )}
          >
            {body}
          </p>
        ) : null}
        {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
