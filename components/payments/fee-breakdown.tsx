import { VouchAmountSummary } from "@/components/vouches/vouch-amount-summary"

export function FeeBreakdown(props: {
  amountCents: number
  platformFeeCents?: number
  currency?: string
  className?: string
}) {
  return <VouchAmountSummary {...props} />
}
