export interface PaymentSummaryProps {
  className?: string
}

export function PaymentSummary({ className }: PaymentSummaryProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/payments/payment-summary.tsx</p>
    </div>
  )
}
