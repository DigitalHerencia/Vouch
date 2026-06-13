export function VouchArchiveSkeleton() {
  return (
    <div className="grid animate-pulse gap-[var(--vouch-section-gap)]">
      <section className="grid gap-4">
        <div className="h-5 w-40 bg-neutral-900" />
        <div className="h-14 w-full max-w-xl bg-neutral-900" />
        <div className="h-5 w-full max-w-2xl bg-neutral-900" />
      </section>
      <div className="overflow-hidden border-3 border-neutral-400 bg-black shadow-vouch-lg">
        <div className="h-14 border-b-3 border-neutral-400 bg-neutral-950" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid h-18 grid-cols-6 items-center gap-4 border-b border-neutral-700 px-5 last:border-b-0"
          >
            {Array.from({ length: 6 }, (_, cell) => (
              <div key={cell} className="h-4 bg-neutral-900" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
