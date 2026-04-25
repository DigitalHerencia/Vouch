export interface StatusBadgeProps {
  className?: string
}

export function StatusBadge({ className }: StatusBadgeProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/status-badge.tsx</p>
    </div>
  )
}
