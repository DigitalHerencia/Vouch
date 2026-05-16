import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PageHero({ eyebrow, title, body, actions, className, contentClassName, titleClassName, bodyClassName }: { eyebrow?: ReactNode; title: ReactNode; body?: ReactNode; actions?: ReactNode; className?: string; contentClassName?: string; titleClassName?: string; bodyClassName?: string }) {
  return (
    <Card className={cn("min-w-0 rounded-none border-0 bg-transparent shadow-none", className)}>
      <CardContent className={cn("space-y-6 p-0", contentClassName)}>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">{eyebrow}</p> : null}
        <h1 className={cn("max-w-4xl text-5xl font-semibold uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl", titleClassName)}>{title}</h1>
        {body ? <p className={cn("max-w-2xl text-base font-semibold leading-7 text-neutral-300 sm:text-lg", bodyClassName)}>{body}</p> : null}
        {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
