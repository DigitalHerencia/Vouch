"use client"

export interface RoutePlaceholderProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function RoutePlaceholder({
  title,
  description = "Stub route shell. Wire this to the matching feature implementation.",
  actionLabel,
  onAction,
}: RoutePlaceholderProps) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
        <p className="mb-3 text-xs tracking-[0.24em] text-neutral-500 uppercase">Vouch</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">{description}</p>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 w-fit rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-100"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  )
}
