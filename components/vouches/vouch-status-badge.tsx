import { Badge } from "@/components/ui/badge"
import type { VouchStatus } from "@/types/vouch"

export interface VouchStatusBadgeProps {
  status: VouchStatus
}

const statusClassName: Record<VouchStatus, string> = {
  draft: "border-neutral-400 bg-black text-neutral-400",
  committed: "border-blue-600 bg-blue-600 text-white",
  sent: "border-blue-600 bg-blue-600 text-white",
  accepted: "border-blue-600 bg-blue-600 text-white",
  authorized: "border-blue-600 bg-blue-600 text-white",
  confirmable: "border-blue-600 bg-blue-600 text-white",
  completed: "border-blue-600 bg-blue-600 text-white",
  expired: "border-red-600 bg-red-600 text-red-600",
}

export function VouchStatusBadge({ status }: VouchStatusBadgeProps) {
  return <Badge className={statusClassName[status]}>{status}</Badge>
}
