import { cn } from "@/lib/utils"

export interface LandingSkeletonProps {
  variant?: "page" | "header" | "process" | "metrics" | "useCases" | "trust"
  className?: string
}

export function LandingSkeleton({ variant = "page", className }: LandingSkeletonProps) {
  if (variant === "header") {
    return (
      <div
        className={cn(
          "flex h-18 items-center justify-between border-b border-neutral-800 px-6 sm:px-8 lg:px-9",
          className
        )}
      >
        <SkeletonBlock className="h-8 w-24" />
        <div className="hidden gap-8 lg:flex">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-10" />
          <SkeletonBlock className="h-3 w-14" />
        </div>
        <SkeletonBlock className="h-10 w-28" />
      </div>
    )
  }

  if (variant === "process") {
    return (
      <div className={cn("w-full border border-neutral-700 bg-[#050706] p-5", className)}>
        <SkeletonBlock className="h-4 w-40" />
        <div className="mt-6 grid gap-4">
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </div>
        <SkeletonBlock className="mt-5 h-12 w-full bg-[#1D4ED8]/30" />
      </div>
    )
  }

  if (variant === "metrics") {
    return (
      <div
        className={cn(
          "mt-12 grid border border-neutral-700 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-b border-neutral-800 p-6 lg:border-r lg:border-b-0">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-5 h-12 w-24" />
            <SkeletonBlock className="mt-4 h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "useCases") {
    return (
      <div className={cn("mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-h-49 border border-neutral-700 bg-[#050706] p-6">
            <SkeletonBlock className="size-9" />
            <SkeletonBlock className="mt-7 h-7 w-36" />
            <SkeletonBlock className="mt-4 h-14 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "trust") {
    return (
      <div
        className={cn(
          "mt-10 grid gap-6 border border-neutral-700 bg-[#050706] p-7 lg:grid-cols-[auto_1fr_auto]",
          className
        )}
      >
        <SkeletonBlock className="size-16" />
        <div>
          <SkeletonBlock className="h-8 w-80 max-w-full" />
          <SkeletonBlock className="mt-4 h-12 w-full max-w-160" />
        </div>
        <SkeletonBlock className="h-14.5 w-65" />
      </div>
    )
  }

  return (
    <div className={cn("px-6 py-10 sm:px-9 lg:px-10 lg:py-12", className)}>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SkeletonBlock className="h-64 w-full max-w-152.5" />
          <SkeletonBlock className="mt-6 h-20 w-full max-w-125" />
          <div className="mt-7 flex gap-4">
            <SkeletonBlock className="h-14.5 w-60" />
            <SkeletonBlock className="h-14.5 w-52.5" />
          </div>
        </div>
        <LandingSkeleton variant="process" />
      </div>
      <LandingSkeleton variant="metrics" />
      <LandingSkeleton variant="useCases" />
      <LandingSkeleton variant="trust" />
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-800/70", className)} />
}
