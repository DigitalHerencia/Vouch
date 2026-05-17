import { Skeleton } from "@/components/ui/skeleton"

export function SignUpSkeleton() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden min-h-dvh px-6 py-10 lg:block lg:px-12">
        <div className="mx-auto grid h-full max-w-3xl content-center gap-6">
          <Skeleton className="h-28 rounded-none border border-neutral-800 bg-black" />
          <Skeleton className="h-52 rounded-none border border-neutral-800 bg-black" />
        </div>
      </aside>
      <section className="flex min-h-dvh items-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="mx-auto grid w-full max-w-xl gap-4">
          <Skeleton className="h-12 rounded-none border border-neutral-800 bg-black" />
          <Skeleton className="h-12 rounded-none border border-neutral-800 bg-black" />
          <Skeleton className="h-12 rounded-none border border-neutral-800 bg-black" />
          <Skeleton className="h-14 rounded-none border border-neutral-800 bg-black" />
        </div>
      </section>
    </main>
  )
}
