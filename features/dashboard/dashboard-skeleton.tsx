// features/dashboard/dashboard-skeleton.tsx

export function DashboardSkeleton() {
  const stats = Array.from({ length: 4 }, (_, index) => `dashboard-stat-${index}`)
  const invoices = Array.from({ length: 3 }, (_, index) => `dashboard-invoice-${index}`)

  return (
    <div className="grid gap-8 md:gap-10">
      <section>
        <div className="flex max-w-5xl animate-pulse flex-col items-start gap-6">
          <div className="h-6 w-44 border-2 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]" />
          <div className="h-18 w-full max-w-2xl bg-neutral-900 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] md:h-22" />
          <div className="h-5 w-full max-w-xl bg-neutral-900" />
        </div>
      </section>

      <section>
        <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {stats.map((key) => (
            <div
              key={key}
              className="flex min-h-26 flex-col justify-center border-3 border-neutral-400 bg-black p-5 shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)] md:min-h-28 md:p-6"
            >
              <div className="h-8 w-10 bg-neutral-900" />
              <div className="mt-3 h-4 w-28 bg-neutral-900" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-7 md:gap-8">
        {invoices.map((key) => (
          <article
            key={key}
            className="animate-pulse border-3 border-neutral-400 bg-black px-6 py-7 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:px-8 md:py-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-neutral-900 pb-5">
              <div className="grid gap-3">
                <div className="h-4 w-36 bg-neutral-900" />
                <div className="h-10 w-64 max-w-full bg-neutral-900 md:w-80" />
                <div className="h-4 w-48 bg-neutral-900" />
              </div>

              <div className="grid justify-items-end gap-2">
                <div className="h-6 w-24 bg-neutral-900" />
                <div className="h-7 w-28 bg-neutral-900" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-3 border-neutral-400 bg-black p-5 md:mt-6 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="h-3 w-44 bg-neutral-900" />
                  <div className="mt-2 h-8 w-40 bg-neutral-900" />
                </div>

                <div className="grid justify-items-end gap-2">
                  <div className="h-3 w-20 bg-neutral-900" />
                  <div className="h-4 w-32 bg-neutral-900" />
                </div>
              </div>

              <div className="h-3 w-full bg-neutral-900" />
              <div className="h-3 w-44 bg-neutral-900" />
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
