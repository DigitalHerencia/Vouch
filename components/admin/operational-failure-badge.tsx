import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function OperationalFailureBadge({
  label = "Operational failure",
  severity = "error",
  className,
}: {
  label?: string
  severity?: "warning" | "error" | "neutral"
  className?: string
}) {
  const classes = {
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    neutral: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  }

  return (
    <Badge variant="outline" className={cn(classes[severity], className)}>
      {label}
    </Badge>
  )
}
