import { VouchStatusBadge as StatusBadge } from "@/components/blocks/status"

export function VouchStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} tone={status === "expired" ? "expired" : "active"} />
}
