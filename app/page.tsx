// app/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { vouchPrimaryButtonClassName } from "@/components/brand/vouch-button-styles"
import { MetricGrid } from "@/components/marketing/metric-grid"
import { ProcessPanel } from "@/components/marketing/process-panel"
import { TrustPanel } from "@/components/marketing/trust-panel"
import { UseCaseGrid } from "@/components/marketing/use-case-grid"

export default function HomePage() {
  return (
    <main>
      <PublicHeader logo={<LogoLockup />} />

      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="pt-2 lg:pt-8">
            <h1 className="max-w-170 font-(family-name:--font-display) text-[64px] leading-[0.86] tracking-[0.015em] text-white uppercase sm:text-[88px] lg:text-[108px]">
              Commitment-
              <br />
              backed payments
              <br />
              for real-world
              <br />
              agreements.
            </h1>

            <p className="mt-7 max-w-140 text-[18px] leading-[1.35] font-semibold text-neutral-300">
              A simple way to protect appointments and in-person agreements. Both parties confirm.
              Then funds release. Otherwise, you’re covered.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up?return_to=/vouches/new"
                className={`${vouchPrimaryButtonClassName} min-w-62.5`}
              >
                <span className="translate-y-px">Create a Vouch</span>
                <ArrowRight className="size-6" strokeWidth={1.8} />
              </Link>

              <Link href="#process" className={`${vouchPrimaryButtonClassName} min-w-55`}>
                <span className="translate-y-px">How it works</span>
                <ArrowDown className="size-5" strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div id="process" className="mx-auto w-full max-w-130 scroll-mt-28 lg:pt-6">
            <ProcessPanel />
          </div>
        </div>

        <MetricGrid />

        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="size-3 bg-[#1D4ED8]" />
            <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase">
              Built for real life
            </p>
          </div>

          <h2 className="mt-6 max-w-212.5 font-(family-name:--font-display) text-[48px] leading-[0.92] tracking-[0.02em] text-white uppercase sm:text-[64px]">
            Protect the moments that matter.
          </h2>

          <p className="mt-4 max-w-170 text-[17px] leading-[1.35] font-semibold text-neutral-400">
            Appointments, meetups, services, consultations, and more. Vouch keeps commitments real.
          </p>

          <UseCaseGrid />
        </section>

        <TrustPanel />
      </section>

      <PublicFooter />
    </main>
  )
}
