import { cn } from "@/lib/utils"

export interface PublicLayoutSkeletonProps {
  variant?: "header" | "page" | "footer"
  className?: string
}

export function PublicLayoutSkeleton({ variant = "page", className }: PublicLayoutSkeletonProps) {
  if (variant === "header") {
    return (
      <div
        className={cn(
          "flex h-18 items-center justify-between border-b border-neutral-800 px-6 sm:px-8 lg:px-9",
          className
        )}
      >
        <SkeletonBlock className="h-8 w-24" />
        <div className="hidden items-center gap-10 lg:flex">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-10" />
          <SkeletonBlock className="h-3 w-14" />
        </div>
        <SkeletonBlock className="h-11 w-28" />
      </div>
    )
  }

  if (variant === "footer") {
    return (
      <div className={cn("border-t border-neutral-800 px-6 py-8 sm:px-9 lg:px-10", className)}>
        <div className="border border-neutral-800 bg-[#050706] p-6">
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="mt-4 h-12 w-full max-w-155" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("px-6 py-10 sm:px-9 lg:px-10 lg:py-12", className)}>
      <SkeletonBlock className="h-56 w-full" />
      <SkeletonBlock className="mt-6 h-32 w-full" />
      <SkeletonBlock className="mt-6 h-48 w-full" />
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-800/70", className)} />
}
