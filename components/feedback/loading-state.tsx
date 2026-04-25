export interface LoadingStateProps {
  className?: string
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/loading-state.tsx</p>
    </div>
  )
}
