export default function TenantPageC() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <Panel title="Top" />
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
