// app/global-error.tsx

"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global application error", {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh overflow-x-hidden bg-black font-sans text-white antialiased">
        <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.22),transparent_34rem),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[auto,48px_48px,48px_48px] px-6 py-12">
          <section className="w-full max-w-205 border border-neutral-700 bg-black/55 p-6 backdrop-blur-sm sm:p-8">
            <div className="border-b border-neutral-800 pb-6">
              <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-widest text-blue-500 uppercase">
                Global error
              </p>

              <h1 className="mt-4 font-(family-name:--font-display) text-[56px] leading-[0.88] tracking-[0.02em] text-white uppercase sm:text-[84px]">
                System view failed.
              </h1>

              <p className="mt-5 max-w-155 text-[16px] leading-[1.4] font-semibold text-neutral-400">
                Vouch could not render this application boundary. Try again. If the failure
                continues, use the diagnostics below while checking server logs.
              </p>
            </div>

            <div className="grid gap-4 border-b border-neutral-800 py-6 sm:grid-cols-2">
              <DiagnosticTile label="Boundary" value="app/global-error.tsx" />
              <DiagnosticTile label="Digest" value={error.digest ?? "not provided"} />
            </div>

            <div className="pt-6">
              <Button type="button" onClick={reset}>
                Try again
              </Button>

              <p className="mt-5 max-w-160 font-mono text-[12px] leading-normal text-neutral-500">
                Client-visible diagnostics are intentionally limited. Check server logs for stack
                traces, provider errors, request IDs, and sensitive operational details.
              </p>
            </div>
          </section>
        </main>
      </body>
    </html>
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
