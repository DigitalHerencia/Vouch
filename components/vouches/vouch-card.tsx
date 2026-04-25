export interface VouchCardProps {
  className?: string
}

export function VouchCard({ className }: VouchCardProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/vouches/vouch-card.tsx</p>
    </div>
  )
}
