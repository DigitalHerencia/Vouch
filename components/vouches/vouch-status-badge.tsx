import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type VouchStatus =
  | "pending"
  | "active"
  | "completed"
  | "expired"
  | "refunded"
  | "canceled"
  | "failed"
  | "awaiting_confirmation"
  | "partially_confirmed"
  | "requires_setup"

const LABELS: Record<VouchStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  expired: "Expired",
  refunded: "Refunded",
  canceled: "Canceled",
  failed: "Failed",
  awaiting_confirmation: "Awaiting confirmation",
  partially_confirmed: "Partially confirmed",
  requires_setup: "Requires setup",
}

const CLASSES: Record<VouchStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  active: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  completed: "border-green-500/30 bg-green-500/10 text-green-200",
  expired: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  refunded: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  canceled: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  failed: "border-red-500/30 bg-red-500/10 text-red-200",
  awaiting_confirmation: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  partially_confirmed: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  requires_setup: "border-amber-500/30 bg-amber-500/10 text-amber-200",
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
