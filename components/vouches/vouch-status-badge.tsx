import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type VouchStatus =
  | "draft"
  | "committed"
  | "sent"
  | "accepted"
  | "authorized"
  | "confirmable"
  | "completed"
  | "expired"

const LABELS: Record<VouchStatus, string> = {
  draft: "Draft",
  committed: "Committed",
  sent: "Sent",
  accepted: "Accepted",
  authorized: "Authorized",
  confirmable: "Confirmable",
  completed: "Completed",
  expired: "Expired",
}

const CLASSES: Record<VouchStatus, string> = {
  draft: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  committed: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  sent: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  accepted: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  authorized: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  confirmable: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  completed: "border-green-500/30 bg-green-500/10 text-green-200",
  expired: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
}

export function VouchStatusBadge({
  status,
  className,
}: {
  status: VouchStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(CLASSES[status], className)}>
      {LABELS[status]}
    </Badge>
  )
}
