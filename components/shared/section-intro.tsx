import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SectionIntro({
  eyebrow,
  title,
  body,
  actions,
  className,
  panel = false,
  titleClassName,
  bodyClassName,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  body?: ReactNode
  actions?: ReactNode
  className?: string
  panel?: boolean
  titleClassName?: string
  bodyClassName?: string
}) {
  const content = (
    <section className={cn("space-y-4", !panel && className)}>
      {eyebrow ? (
        <p className="text-primary flex items-center gap-3 font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] uppercase">
          <span className="bg-primary size-2" />
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

  if (!panel) return content

  return (
    <Card className={cn("flex min-h-0 p-5 sm:p-6 md:p-8", className)}>
      <CardContent className="flex h-full flex-col justify-center p-0">{content}</CardContent>
    </Card>
  )
}
