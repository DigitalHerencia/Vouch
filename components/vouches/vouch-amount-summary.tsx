import { cn } from "@/lib/utils"

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export function VouchAmountSummary({
  amountCents,
  platformFeeCents = 0,
  currency = "usd",
  className,
}: {
  amountCents: number
  platformFeeCents?: number
  currency?: string
  className?: string
}) {
  const totalCents = amountCents + platformFeeCents

  return (
    <dl className={cn("grid gap-2 text-sm", className)}>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Vouch amount</dt>
        <dd className="font-medium tabular-nums">{formatMoney(amountCents, currency)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Platform fee</dt>
        <dd className="font-medium tabular-nums">{formatMoney(platformFeeCents, currency)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t pt-2">
        <dt className="text-foreground">Total commitment</dt>
        <dd className="font-semibold tabular-nums">{formatMoney(totalCents, currency)}</dd>
      </div>
    </dl>
  )
}
