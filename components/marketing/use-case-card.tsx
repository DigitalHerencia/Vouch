export interface UseCaseCardProps {
  className?: string
}

export function UseCaseCard({ className }: UseCaseCardProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/marketing/use-case-card.tsx</p>
    </div>
  )
}
