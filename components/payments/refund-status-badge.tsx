import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type RefundStatus = "not_required" | "pending" | "succeeded" | "failed"

const LABELS: Record<RefundStatus, string> = {
  not_required: "Refund not required",
  pending: "Refund pending",
  succeeded: "Refunded",
  failed: "Refund failed",
}

const CLASSES: Record<RefundStatus, string> = {
  not_required: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  succeeded: "border-green-500/30 bg-green-500/10 text-green-200",
  failed: "border-red-500/30 bg-red-500/10 text-red-200",
}

export function RefundStatusBadge({
  status,
  className,
}: {
  status: RefundStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(CLASSES[status], className)}>
      {LABELS[status]}
    </Badge>
  )
}
