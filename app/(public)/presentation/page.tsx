export default function ThreeRowLayoutPage() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-3 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2">
          <Panel title="Top Left" />
          <Panel title="Top Right" />
        </div>

        <Panel title="Middle Row" />

        <Panel title="Bottom Row" />
      </section>
    </main>
  )
}

function Panel({ title }: { title: string }) {
  return (
    <div className="flex min-h-0 border border-neutral-700 bg-neutral-900/70 p-6 shadow-sm md:p-8">
      <div className="flex w-full flex-col justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.18em] text-blue-600 uppercase">Section</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="max-w-prose text-sm leading-6 text-neutral-400">
            Content sits inside consistent padding with balanced X/Y spacing.
          </p>
        </div>
      </div>
    </div>
  )
}
