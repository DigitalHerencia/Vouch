import type { ReactNode } from "react"

type LegalPageProps = {
  title: string
  updatedLabel?: string
  children?: ReactNode
}

export function LegalPage({ title, updatedLabel = "Draft", children }: LegalPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Legal</p>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{updatedLabel}</p>
      </div>
      <div className="prose prose-invert max-w-none">
        {children ?? (
          <>
            <p>Vouch is a payment coordination tool for appointments and in-person agreements. Vouch is not a marketplace, broker, escrow provider, safety guarantor, or dispute-resolution platform.</p>
            <p>Payment outcomes are based on deterministic confirmation rules: both parties confirm presence within the confirmation window, or funds do not release.</p>
          </>
        )}
      </div>
    </main>
  )
}
