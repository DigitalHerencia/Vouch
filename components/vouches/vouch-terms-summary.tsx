import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface VouchTermsSummaryProps {
  title: string
  merchantLabel: string
  customerLabel: string
  amountLabel: string
  windowLabel: string
  labels: Record<string, string>
}

export function VouchTermsSummary({
  title,
  merchantLabel,
  customerLabel,
  amountLabel,
  windowLabel,
  labels,
}: VouchTermsSummaryProps) {
  const rows = [
    [labels.merchant, merchantLabel],
    [labels.customer, customerLabel],
    [labels.amount, amountLabel],
    [labels.window, windowLabel],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="border-b border-neutral-400 p-5 sm:border-r sm:last:border-r-0 lg:border-b-0"
          >
            <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-400 uppercase">
              {label}
            </p>
            <p className="mt-3 text-base leading-6 font-bold text-white">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
