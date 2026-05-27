import { Skeleton } from "@/components/ui/skeleton"

export function SignInSkeleton() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)_minmax(0,1fr)]">
      <section className="flex min-h-dvh items-center px-6 py-24 sm:px-10 lg:col-start-2 lg:px-8">
        <div className="mx-auto grid w-full max-w-xl gap-4">
          <Skeleton className="h-16 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-12 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-12 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-14 rounded-none border border-neutral-400 bg-black/60" />
        </div>
      </section>
      <aside className="hidden min-h-dvh content-center lg:grid">
        <div className="grid gap-5">
          <Skeleton className="h-20 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-32 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-20 rounded-none border border-neutral-400 bg-black/60" />
        </div>
      </aside>
      <aside className="hidden min-h-dvh content-center lg:grid">
        <div className="grid gap-5">
          <Skeleton className="h-20 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-32 rounded-none border border-neutral-400 bg-black/60" />
          <Skeleton className="h-20 rounded-none border border-neutral-400 bg-black/60" />
        </div>
      </aside>
    </main>
  )
}
