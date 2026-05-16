import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SectionIntro({ eyebrow, title, body, actions, className, titleClassName, bodyClassName }: { eyebrow?: ReactNode; title: ReactNode; body?: ReactNode; actions?: ReactNode; className?: string; titleClassName?: string; bodyClassName?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">{eyebrow}</p> : null}
      <h2 className={cn("text-3xl font-semibold uppercase tracking-tight text-white sm:text-4xl", titleClassName)}>{title}</h2>
      {body ? <p className={cn("max-w-2xl text-sm leading-6 text-neutral-400", bodyClassName)}>{body}</p> : null}
      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </section>
  )
}
