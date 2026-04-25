export interface ErrorStateProps {
  className?: string
}

export function ErrorState({ className }: ErrorStateProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/error-state.tsx</p>
    </div>
  )
}
