import { Skeleton } from "@/components/ui/skeleton"
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-none border border-neutral-400 bg-black" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-none bg-neutral-700" />
        <Skeleton className="h-32 rounded-none bg-neutral-700" />
        <Skeleton className="h-32 rounded-none bg-neutral-700" />
      </div>
      <Skeleton className="h-64 rounded-none border border-neutral-400 bg-black" />
    </div>
  )
}
