// app/loading.tsx

export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section
        role="status"
        aria-live="polite"
        aria-label="Loading Vouch"
        className="w-full max-w-180 border border-neutral-700 bg-black/45 p-6 backdrop-blur-[2px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-6 border-b border-neutral-800 pb-6">
          <div>
            <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-primary uppercase">
              Loading
            </p>
            <h1 className="mt-4 font-(family-name:--font-display) text-[52px] leading-[0.9] tracking-[0.02em] text-white uppercase sm:text-[72px]">
              Vouch
            </h1>
          </div>

          <div className="grid size-16 grid-cols-2 border border-neutral-700">
            <div className="border-r border-b border-neutral-700 bg-primary" />
            <div className="border-b border-neutral-700 bg-black/60" />
            <div className="border-r border-neutral-700 bg-black/60" />
            <div className="bg-primary" />
          </div>
        </div>

        <div className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-(family-name:--font-display) text-[16px] tracking-[0.08em] text-white uppercase">
              Preparing route
            </p>
            <p className="font-mono text-[12px] font-bold text-neutral-500">00 / SYSTEM</p>
          </div>

          <div className="mt-5 h-4 overflow-hidden border border-neutral-700 bg-black">
            <div className="h-full w-2/3 animate-[vouch-load_1.15s_ease-in-out_infinite] bg-primary" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <LoadingBlock label="Auth" />
            <LoadingBlock label="State" />
            <LoadingBlock label="View" />
          </div>

          <p className="mt-6 max-w-130 text-[14px] leading-[1.4] font-semibold text-neutral-400">
            Loading the next Vouch surface. Payment, confirmation, and account state remain
            server-authoritative.
          </p>
        </div>
      </section>
    </main>
  )
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="border border-neutral-800 bg-black/40 p-4">
      <div className="h-2 w-10 bg-primary" />
      <p className="mt-4 font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-neutral-300 uppercase">
        {label}
      </p>
    </div>
  )
}
