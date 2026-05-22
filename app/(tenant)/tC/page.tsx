export default function TenantPageC() {
  return (
    <main className="min-h-screen p-2 text-white md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-2 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-2">
        <Panel title="Header" />
        <Panel title="Body" />
      </section>
    </main>
  )
}

function Panel({ title }: { title: string }) {
  return (
    <div className="flex min-h-0 border border-neutral-400 bg-black p-6 md:p-8">
      <div className="flex w-full flex-col justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">Section</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="max-w-prose text-sm leading-6 text-neutral-400">
            Content sits inside consistent padding with balanced X/Y spacing.
          </p>
        </div>
      </div>
    </div>
  )
}
