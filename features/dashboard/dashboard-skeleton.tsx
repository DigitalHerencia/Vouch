export function DashboardSkeleton() {
  const stats = Array.from({ length: 4 }, (_, index) => `dashboard-stat-${index}`)
  const invoices = Array.from({ length: 3 }, (_, index) => `dashboard-invoice-${index}`)

  return (
    <main className="mb-16 animate-pulse">
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="flex flex-col items-start gap-8">
          <div className="h-9 w-52 border-2 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]" />
          <div className="h-16 w-full max-w-lg bg-neutral-900" />
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((key) => (
            <div
              key={key}
              className="h-36 border-3 border-neutral-400 bg-black p-6 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
            >
              <div className="h-12 w-14 bg-neutral-900" />
              <div className="mt-4 h-6 w-24 bg-neutral-900" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 px-4 md:px-8 lg:px-16">
        {invoices.map((key) => (
          <section
            key={key}
            className="border-3 border-neutral-400 bg-black px-12 py-16 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-6 pb-4">
              <div className="grid gap-3">
                <div className="h-5 w-36 bg-neutral-900" />
                <div className="h-10 w-64 bg-neutral-900" />
                <div className="h-5 w-40 bg-neutral-900" />
              </div>
              <div className="grid justify-items-end gap-3">
                <div className="h-7 w-24 bg-neutral-900" />
                <div className="h-9 w-28 bg-neutral-900" />
              </div>
            </div>
            <div className="grid gap-4 border-3 border-neutral-400 bg-black p-6">
              <div className="h-4 w-44 bg-neutral-900" />
              <div className="h-9 w-36 bg-neutral-900" />
              <div className="h-4 w-full bg-neutral-900" />
              <div className="h-4 w-48 bg-neutral-900" />
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
