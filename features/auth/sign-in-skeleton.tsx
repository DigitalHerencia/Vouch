function AuthSkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse border-3 border-neutral-400 bg-black/55 ${className}`}
    />
  )
}

export function SignInSkeleton() {
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-12 py-24">
      <div className="mx-auto w-full max-w-md">
        <div className="border-3 border-neutral-400 bg-transparent p-6">
          <div className="mb-6 grid justify-items-center gap-3">
            <AuthSkeletonBlock className="h-12 w-48" />
            <AuthSkeletonBlock className="h-4 w-56" />
          </div>
          <div className="grid gap-4">
            <AuthSkeletonBlock className="h-12 w-full" />
            <AuthSkeletonBlock className="h-12 w-full" />
            <AuthSkeletonBlock className="h-4 w-40" />
            <AuthSkeletonBlock className="h-14 w-full" />
            <AuthSkeletonBlock className="mx-auto h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  )
}
