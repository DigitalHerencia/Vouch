import { CheckCircle2, CircleAlert, CircleDashed, LockKeyhole } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type SetupChecklistItemStatus = "complete" | "blocked" | "pending" | "not_started"

const STATUS_ICON = {
  complete: CheckCircle2,
  blocked: LockKeyhole,
  pending: CircleDashed,
  not_started: CircleAlert,
} satisfies Record<SetupChecklistItemStatus, typeof CheckCircle2>

export function SetupChecklistItem({
  title,
  description,
  status,
  action,
}: {
  title: string
  description: string
  status: SetupChecklistItemStatus
  action?: ReactNode
}) {
  const Icon = STATUS_ICON[status]
  const complete = status === "complete"

  return (
    <div className="grid gap-4 border border-neutral-800 bg-black/45 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span
        className={cn(
          "grid size-10 place-items-center border",
          complete ? "border-green-700 bg-green-950/30 text-green-400" : "border-blue-900 bg-blue-950/30 text-blue-500",
        )}
      >
        <Icon className="size-5" />
      </span>

      <span>
        <strong className="block text-white">{title}</strong>
        <span className="mt-1 block text-sm text-neutral-400">{description}</span>
      </span>

      <span className="flex items-center gap-3">
        <Badge variant="outline" className="rounded-none border-neutral-700 font-mono text-xs uppercase">
          {status.replaceAll("_", " ")}
        </Badge>
        {action}
      </span>
    </div>
  )
}
