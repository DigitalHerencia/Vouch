import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PaymentStatusPanel({
  title,
  amountLabel,
  merchantReceivesLabel,
  customerTotalLabel,
  paymentStatusLabel,
  settlementStatusLabel,
  labels,
}: {
  title: string
  amountLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  labels: Record<string, string>
}) {
  const rows = [
    [labels.vouchAmount, amountLabel],
    [labels.merchantReceives, merchantReceivesLabel],
    [labels.customerAuthorizes, customerTotalLabel],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-neutral-800">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 border-b border-neutral-800 px-4 py-3 last:border-b-0"
            >
              <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
                {label}
              </p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-blue-700 bg-blue-950/50 text-blue-200">
            {paymentStatusLabel}
          </Badge>
          <Badge className="border-neutral-700 bg-neutral-950 text-neutral-300">
            {settlementStatusLabel}
          </Badge>
        </div>
        <Alert>
          <AlertDescription>
            Stripe owns payment truth. Vouch retrieves provider state before settlement-critical
            operations and displays only safe provider-backed status.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
