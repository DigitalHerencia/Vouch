import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type PaymentStatus =
  | "not_started"
  | "requires_payment_method"
  | "authorized"
  | "captured"
  | "release_pending"
  | "released"
  | "refund_pending"
  | "refunded"
  | "voided"
  | "failed"

const LABELS: Record<PaymentStatus, string> = {
  not_started: "Not started",
  requires_payment_method: "Payment method required",
  authorized: "Authorized",
  captured: "Captured",
  release_pending: "Release pending",
  released: "Released",
  refund_pending: "Refund pending",
  refunded: "Refunded",
  voided: "Voided",
  failed: "Failed",
}

const CLASSES: Record<PaymentStatus, string> = {
  not_started: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  requires_payment_method: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  authorized: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  captured: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  release_pending: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  released: "border-green-500/30 bg-green-500/10 text-green-200",
  refund_pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  refunded: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  voided: "border-neutral-500/30 bg-neutral-500/10 text-neutral-200",
  failed: "border-red-500/30 bg-red-500/10 text-red-200",
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(CLASSES[status], className)}>
      {LABELS[status]}
    </Badge>
  )
}
