export interface EmptyStateProps {
  className?: string
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/empty-state.tsx</p>
    </div>
  )
}
