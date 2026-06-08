export function VouchFormSkeleton() {
  return (
    <main className="h-[calc(100dvh-8rem)] overflow-hidden p-4 md:p-8 lg:p-12">
      <section className="grid h-full min-h-0 gap-8 overflow-hidden md:gap-16">
        <div className="flex min-h-0 overflow-hidden border border-neutral-400 bg-black p-3 md:p-4">
          <div className="grid min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
            <div className="border-b border-neutral-400 pb-3">
              <div className="h-3 w-16 bg-blue-600" />
              <div className="mt-3 h-6 w-44 bg-neutral-800" />
            </div>
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="border border-neutral-400 bg-black p-4">
                <div className="h-12 border border-neutral-400 bg-neutral-900" />
                <div className="mt-3 h-12 border border-neutral-400 bg-neutral-900" />
                <div className="mt-3 h-12 border border-neutral-400 bg-neutral-900" />
              </div>
              <div className="border border-neutral-400 bg-black p-4">
                <div className="h-10 w-60 bg-neutral-800" />
                <div className="mt-6 h-14 border border-neutral-400 bg-neutral-900" />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="h-20 border border-neutral-400 bg-neutral-900" />
                  <div className="h-20 border border-neutral-400 bg-neutral-900" />
                  <div className="h-20 border border-neutral-400 bg-neutral-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
