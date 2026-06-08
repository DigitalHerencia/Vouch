export function VouchFormSkeleton() {
  const steps = Array.from({ length: 3 }, (_, index) => `vouch-form-step-${index}`)

  return (
    <div className="grid gap-8 md:gap-10">
      <section>
        <div className="flex max-w-5xl animate-pulse flex-col items-start gap-5">
          <div className="h-6 w-40 border-2 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]" />
          <div className="h-16 w-full max-w-xl bg-neutral-900 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] md:h-20" />
          <div className="h-5 w-full max-w-2xl bg-neutral-900" />
        </div>
      </section>

      <section>
        <div className="mx-auto grid w-full max-w-5xl animate-pulse gap-8">
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-24 bg-neutral-900" />
              <div className="h-4 w-24 bg-neutral-900" />
            </div>
            <div className="h-3 w-full bg-neutral-900" />
          </div>

          <div className="flex items-center justify-center gap-2">
            {steps.map((key, index) => (
              <div key={key} className="flex items-center gap-2">
                <div className="h-11 w-11 border-3 border-neutral-400 bg-neutral-900" />
                {index < steps.length - 1 ? <div className="h-1 w-8 bg-neutral-900" /> : null}
              </div>
            ))}
          </div>

          <div className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
            <div className="grid justify-items-center gap-5 border-b-3 border-neutral-400 px-6 py-8 md:px-8 md:py-10">
              <div className="h-16 w-16 border-3 border-neutral-400 bg-neutral-900" />
              <div className="h-12 w-72 max-w-full bg-neutral-900" />
            </div>

            <div className="grid gap-8 px-6 py-8 md:px-8">
              <div className="grid gap-4">
                <div className="h-5 w-full max-w-xl bg-neutral-900" />
                <div className="h-5 w-full max-w-lg bg-neutral-900" />
                <div className="h-5 w-full max-w-md bg-neutral-900" />
              </div>

              <div className="flex items-center justify-between">
                <div className="h-12 w-28 border-2 border-neutral-400 bg-neutral-900" />
                <div className="h-12 w-36 border-2 border-neutral-400 bg-neutral-900" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
