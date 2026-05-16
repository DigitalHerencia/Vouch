import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"

export interface PaymentStatusPanelProps {
  amountLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  labels: {
    vouchAmount: string
    merchantReceives: string
    customerAuthorizes: string
  }
  title: string
}

export function PaymentStatusPanel({
  amountLabel,
  merchantReceivesLabel,
  customerTotalLabel,
  paymentStatusLabel,
  settlementStatusLabel,
  labels,
  title,
}: PaymentStatusPanelProps) {
  return (
    <Surface variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">{title}</h2>
      </SurfaceHeader>
      <SurfaceBody className="font-mono text-sm">
        <Line label={labels.vouchAmount} value={amountLabel} />
        <Line label={labels.merchantReceives} value={merchantReceivesLabel} />
        <Line label={labels.customerAuthorizes} value={customerTotalLabel} strong />
        <p className="mt-4 flex flex-wrap gap-2">
          <Badge className="rounded-none border-green-700 bg-green-950 text-green-400">
            {paymentStatusLabel}
          </Badge>
          <Badge className="rounded-none border-neutral-700 bg-neutral-950 text-neutral-200">
            {settlementStatusLabel}
          </Badge>
        </p>
      </SurfaceBody>
    </Surface>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-800 py-2">
      <span className="text-neutral-300">{label}</span>
      <span className={strong ? "text-primary" : "text-white"}>{value}</span>
    </div>
  )
}
