function AuthSkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse border-3 border-neutral-400 bg-black/55 ${className}`}
    />
  )
}

export function SignUpSkeleton() {
  return (
    <div className="relative z-10 grid min-h-dvh place-items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="border-3 border-neutral-400 bg-transparent p-6">
          <div className="mb-6 grid justify-items-center gap-3">
            <AuthSkeletonBlock className="h-14 w-64" />
            <AuthSkeletonBlock className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <AuthSkeletonBlock className="h-12 w-full" />
              <AuthSkeletonBlock className="h-12 w-full" />
            </div>
            <AuthSkeletonBlock className="h-12 w-full" />
            <AuthSkeletonBlock className="h-12 w-full" />
            <AuthSkeletonBlock className="h-16 w-full" />
            <AuthSkeletonBlock className="h-14 w-full" />
            <AuthSkeletonBlock className="mx-auto h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  )
}
