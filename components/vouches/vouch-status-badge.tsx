export interface VouchStatusBadgeProps {
  className?: string
}

export function VouchStatusBadge({ className }: VouchStatusBadgeProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/vouches/vouch-status-badge.tsx</p>
    </div>
  )
}
