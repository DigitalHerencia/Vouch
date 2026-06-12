export function VouchDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="grid gap-6 border-3 border-neutral-400 bg-black p-5 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:p-8">
        <div className="h-6 w-40 bg-neutral-900" />
        <div className="h-12 w-72 max-w-full bg-neutral-900" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 border border-neutral-600 bg-neutral-950" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 border-2 border-neutral-500 bg-neutral-950" />
          <div className="h-64 border-2 border-neutral-500 bg-neutral-950" />
        </div>
        <div className="h-72 border-2 border-neutral-500 bg-neutral-950" />
        <div className="h-40 border-2 border-neutral-500 bg-neutral-950" />
      </section>
    </div>
  )
}
