import { vouchPageCopy } from "@/content/vouches"

export function VouchDetailSkeleton() {
  return (
    <article
      aria-label={vouchPageCopy.loadingDetailsLabel}
      className="w-full animate-pulse border-3 border-neutral-400 bg-black shadow-vouch-lg"
    >
      <div className="grid gap-6 p-5 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-neutral-900 pb-5">
          <div className="grid gap-3">
            <div className="h-6 w-28 bg-neutral-900" />
            <div className="h-12 w-72 max-w-full bg-neutral-900" />
            <div className="h-4 w-52 max-w-full bg-neutral-900" />
          </div>
          <div className="grid justify-items-end gap-2">
            <div className="h-6 w-24 bg-neutral-900" />
            <div className="h-9 w-28 bg-neutral-900" />
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 border border-neutral-600 bg-neutral-950" />
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="h-64 border-2 border-neutral-500 bg-neutral-950" />
          <section className="h-64 border-2 border-neutral-500 bg-neutral-950" />
        </div>

        <section className="h-72 border-2 border-neutral-500 bg-black" />
        <section className="h-40 border-2 border-neutral-500 bg-neutral-950" />
      </div>
    </article>
  )
}
