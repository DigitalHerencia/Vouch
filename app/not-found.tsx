// app/not-found.tsx

import Link from "next/link"
import { ArrowLeft, LayoutDashboard } from "lucide-react"

const DIAGNOSTICS = [
  {
    label: "Boundary",
    value: "app/not-found.tsx",
  },
  {
    label: "Status",
    value: "404",
  },
  {
    label: "Access",
    value: "participant-scoped",
  },
] as const

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="vouch-surface w-full max-w-205 p-6 sm:p-8">
        <div className="border-b border-neutral-800 pb-6">
          <p className="vouch-label text-blue-500">404 / Not found</p>

          <h1 className="mt-4 font-(family-name:--font-display) text-[56px] leading-[0.88] tracking-[0.02em] text-white uppercase sm:text-[84px]">
            This route does not exist.
          </h1>

          <p className="mt-5 max-w-160 text-[16px] leading-[1.4] font-semibold text-neutral-400">
            The requested Vouch surface could not be found. Protected records may also return not
            found when the active user is not an authorized participant.
          </p>
        </div>

        <div className="grid gap-4 border-b border-neutral-800 py-6 sm:grid-cols-3">
          {DIAGNOSTICS.map((item) => (
            <DiagnosticTile key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-3 border border-blue-700 bg-blue-700 px-7 font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-white uppercase transition-colors hover:bg-blue-600"
          >
            <LayoutDashboard className="size-5" strokeWidth={1.8} />
            Go to dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-3 border border-neutral-700 bg-black/45 px-7 font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-white uppercase transition-colors hover:border-white"
          >
            <ArrowLeft className="size-5" strokeWidth={1.8} />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  )
}

function DiagnosticTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-800 bg-black/45 p-4">
      <p className="font-(family-name:--font-display) text-[13px] tracking-[0.08em] text-neutral-500 uppercase">
        {label}
      </p>

      <p className="mt-3 font-mono text-[12px] font-bold break-all text-neutral-300">{value}</p>
    </div>
  )
}
