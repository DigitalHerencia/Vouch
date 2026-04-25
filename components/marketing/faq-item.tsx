export interface FaqItemProps {
  className?: string
}

export function FaqItem({ className }: FaqItemProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/marketing/faq-item.tsx</p>
    </div>
  )
}
