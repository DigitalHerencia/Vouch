import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { VouchStatus } from "@/types/vouch"

export interface VouchDetailHeaderProps {
  vouchId: string
  title: string
  amountLabel: string
  appointmentLabel: string
  statusLabel: VouchStatus | string
  currentUserRoleLabel: "merchant" | "customer" | "participant"
  copy: {
    title: string
    heroBody: string
    labels: {
      status: string
      amount: string
      role: string
    }
  }
  className?: string | undefined
}

export function VouchDetailHeader({
  vouchId,
  title,
  amountLabel,
  appointmentLabel,
  statusLabel,
  currentUserRoleLabel,
  copy,
  className,
}: VouchDetailHeaderProps) {
  return (
    <Card className={cn("grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto]", className)}>
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold tracking-[0.08em] text-neutral-500 uppercase">
          {copy.title} / {vouchId}
        </p>
        <h1 className="mt-3 max-w-5xl font-(family-name:--font-brand) text-[clamp(2.75rem,6vw,5rem)] leading-[0.88] break-all text-white uppercase">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 font-bold text-neutral-400">
          {copy.heroBody.replace("{appointmentLabel}", appointmentLabel)}
        </p>
      </div>
      <div className="grid gap-3 self-start sm:grid-cols-3 lg:min-w-96 lg:grid-cols-1">
        <StatusItem label={copy.labels.status} value={statusLabel} />
        <StatusItem label={copy.labels.amount} value={amountLabel} />
        <StatusItem label={copy.labels.role} value={currentUserRoleLabel} />
      </div>
    </Card>
  )
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-800 bg-neutral-950/70 p-4">
      <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
        {label}
      </p>
      <Badge className="mt-3 border-neutral-700 bg-black text-neutral-100">{value}</Badge>
    </div>
  )
}
