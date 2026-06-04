import type { ComponentProps, ElementType } from "react"
import { AlertCircle, Check, Clock, WifiOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

const statusToneConfig: Record<
  VouchStatusTone,
  {
    badge: ComponentProps<typeof Badge>["variant"]
    icon: ElementType
  }
> = {
  active: { badge: "default", icon: Clock },
  pending: { badge: "secondary", icon: Clock },
  complete: { badge: "success", icon: Check },
  failed: { badge: "destructive", icon: AlertCircle },
  expired: { badge: "outline", icon: AlertCircle },
  offline: { badge: "warning", icon: WifiOff },
}

export function VouchStatusBadge({
  status,
  tone = "pending",
  className,
}: {
  status: string
  tone?: VouchStatusTone
  className?: string
}) {
  const config = statusToneConfig[tone]
  const Icon = config.icon

  return (
    <Badge variant={config.badge} className={className}>
      <Icon className="mr-1.5 size-3.5" />
      {status}
    </Badge>
  )
}
