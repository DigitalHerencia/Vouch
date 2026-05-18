import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CalloutPanel({
  title,
  body,
  icon: Icon,
  actions,
  className,
}: {
  title: ReactNode
  body?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("p-5 text-white sm:p-6", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {Icon ? <Icon className="size-10 shrink-0 text-white" strokeWidth={1.7} /> : null}
        <div className="min-w-0 flex-1">
          <CardTitle className="text-3xl">{title}</CardTitle>
          {body ? (
            <CardDescription className="mt-2 text-sm leading-6 font-bold text-neutral-400">
              {body}
            </CardDescription>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
    </Card>
  )
}
