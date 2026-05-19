export default function AuthPageD1() {
  return (
    <main className="p-2 md:p-8">
      <section className="grid h-[calc(100vh-13rem)] w-full grid-cols-1 md:grid-cols-2">
        <Panel title="authContent" />

        <Panel title="signInForm" />
      </section>
    </main>
  )
}

function Panel({ title }: { title: string }) {
  return (
    <div className="border border-neutral-700 bg-neutral-950 p-6 md:p-8">
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">Section</p>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-100">{title}</h2>
          <p className="max-w-prose text-sm leading-6 text-neutral-400">
            Content sits inside consistent padding with balanced X/Y spacing.
          </p>
        </div>
      </div>
    </div>
  )
}
