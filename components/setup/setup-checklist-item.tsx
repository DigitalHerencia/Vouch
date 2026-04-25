import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react"

import { cn } from "@/lib/utils"

export type SetupChecklistItemStatus = "complete" | "blocked" | "pending" | "not_started"

const ICONS = {
  complete: CheckCircle2,
  blocked: CircleAlert,
  pending: CircleDashed,
  not_started: CircleDashed,
} satisfies Record<SetupChecklistItemStatus, typeof CheckCircle2>

export function SetupChecklistItem({
  title,
  description,
  status,
  action,
  className,
}: {
  title: string
  description: string
  status: SetupChecklistItemStatus
  action?: React.ReactNode
  className?: string
}) {
  const Icon = ICONS[status]
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-3", className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-4", status === "complete" ? "text-green-400" : status === "blocked" ? "text-amber-400" : "text-muted-foreground")} aria-hidden="true" />
        <div className="grid gap-1">
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
