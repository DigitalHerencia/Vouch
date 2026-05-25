export function DashboardSkeleton() {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] gap-4 p-4 md:p-8">
      <div className="h-32 animate-pulse border-3 border-neutral-400 bg-neutral-900" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-40 animate-pulse border-3 border-neutral-400 bg-neutral-900" />
        <div className="h-40 animate-pulse border-3 border-neutral-400 bg-neutral-900" />
        <div className="h-40 animate-pulse border-3 border-neutral-400 bg-neutral-900" />
      </div>
    </div>
  )
}
