import type { ReactNode } from "react"
import { CalendarDays, Clock, UserRound } from "lucide-react"

export interface VouchTermsSummaryProps {
  merchantLabel: string
  customerLabel: string
  amountLabel: string
  windowLabel: string
  labels: {
    merchant: string
    customer: string
    amount: string
    window: string
  }
}

export function VouchTermsSummary({
  merchantLabel,
  customerLabel,
  amountLabel,
  windowLabel,
  labels,
}: VouchTermsSummaryProps) {
  return (
    <section className="grid gap-4 border-y border-neutral-800 py-5 sm:grid-cols-2 lg:grid-cols-4">
      <InfoBlock icon={<UserRound />} label={labels.merchant} value={merchantLabel} />
      <InfoBlock icon={<UserRound />} label={labels.customer} value={customerLabel} />
      <InfoBlock icon={<CalendarDays />} label={labels.amount} value={amountLabel} />
      <InfoBlock icon={<Clock />} label={labels.window} value={windowLabel} />
    </section>
  )
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm text-neutral-400">
      <span className="text-primary">{icon}</span>
      <span>
        <span className="block">{label}</span>
        <strong className="font-mono text-white">{value}</strong>
      </span>
    </div>
  )
}
