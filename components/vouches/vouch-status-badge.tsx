import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VouchStatus } from "@/types/vouch"

export interface VouchStatusBadgeProps {
  status: VouchStatus
  className?: string | undefined
}

const statusClassName: Record<VouchStatus, string> = {
  draft: "border-neutral-700 bg-neutral-950 text-neutral-300",
  committed: "border-blue-700 bg-blue-950/50 text-blue-100",
  sent: "border-blue-700 bg-blue-950/50 text-blue-100",
  accepted: "border-blue-700 bg-blue-950/50 text-blue-100",
  authorized: "border-primary bg-primary/15 text-blue-100",
  confirmable: "border-primary bg-primary/20 text-white",
  completed: "border-emerald-500/45 bg-emerald-500/10 text-emerald-200",
  expired: "border-red-500/45 bg-red-500/10 text-red-200",
}

export function VouchStatusBadge({ status, className }: VouchStatusBadgeProps) {
  return <Badge className={cn(statusClassName[status], className)}>{status}</Badge>
}
