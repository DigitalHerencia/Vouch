export interface PaymentStatusCardProps {
  className?: string
}

export function PaymentStatusCard({ className }: PaymentStatusCardProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/payments/payment-status-card.tsx</p>
    </div>
  )
}
