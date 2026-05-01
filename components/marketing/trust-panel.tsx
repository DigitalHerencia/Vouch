// components/marketing/trust-panel.tsx

import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

export function TrustPanel() {
  return (
    <section className="mt-10 grid gap-6 border border-neutral-700 bg-black/55 p-7 backdrop-blur-[2px] sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <div className="flex size-16 items-center justify-center">
        <ShieldCheck className="size-14 text-white" strokeWidth={1.7} />
      </div>

      <div>
        <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-wider text-white uppercase">
          Serious by design. Trusted by default.
        </h2>
        <p className="mt-4 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
          We’re not a marketplace. We don’t rate. We don’t arbitrate. We protect commitments so you
          can show up with confidence.
        </p>
      </div>

      <Link
        href="/legal/terms"
        className="inline-flex h-14.5 min-w-62.5 items-center justify-center gap-6 bg-[#1D4ED8] px-7 text-center font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-white uppercase transition-colors hover:bg-blue-700"
      >
        Learn our principles
        <ArrowRight className="size-5" strokeWidth={1.9} />
      </Link>
    </section>
  )
}
