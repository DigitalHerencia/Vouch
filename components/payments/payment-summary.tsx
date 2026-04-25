import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentStatusBadge, type PaymentStatus } from "@/components/payments/payment-status-badge"
import { VouchAmountSummary } from "@/components/vouches/vouch-amount-summary"
import { cn } from "@/lib/utils"

export function PaymentSummary({
  paymentStatus,
  amountCents,
  platformFeeCents = 0,
  currency = "usd",
  note = "Payments are processed through provider infrastructure. Vouch coordinates the release/refund rule and does not directly custody funds.",
  className,
}: {
  paymentStatus: PaymentStatus
  amountCents: number
  platformFeeCents?: number
  currency?: string
  note?: string
  className?: string
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <CardTitle>Payment summary</CardTitle>
        <PaymentStatusBadge status={paymentStatus} />
      </CardHeader>
      <CardContent className="grid gap-4">
        <VouchAmountSummary amountCents={amountCents} platformFeeCents={platformFeeCents} currency={currency} />
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}
