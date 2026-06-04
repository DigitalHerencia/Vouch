export function VouchDetailSkeleton() {
  return (
    <main className="animate-pulse px-4 py-16 md:px-8 lg:px-16">
      <section className="border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className="h-6 w-40 bg-neutral-900" />
        <div className="mt-4 h-12 w-72 max-w-full bg-neutral-900" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-28 border border-neutral-400 bg-neutral-900" />
          <div className="h-28 border border-neutral-400 bg-neutral-900" />
          <div className="h-28 border border-neutral-400 bg-neutral-900" />
        </div>
        <div className="mt-8 h-48 border border-neutral-400 bg-neutral-900" />
      </section>
    </main>
  )
}
