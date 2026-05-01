// components/marketing/trust-panel.tsx

import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { vouchPrimaryButtonClassName } from "@/components/brand/button-styles"

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
        href="/sign-up?return_to=/vouches/new"
        className={`${vouchPrimaryButtonClassName} min-w-72`}
      >
        <span className="translate-y-px">Create a Vouch</span>
        <ArrowRight className="size-5 sm:size-6" strokeWidth={1.9} />
      </Link>
    </section>
  )
}
