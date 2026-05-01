// components/marketing/public-cta-panel.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { vouchPrimaryButtonClassName } from "@/components/brand/button-styles"
import { VouchPanel } from "@/components/brand/vouch-elements"

export function PublicCtaPanel() {
  return (
    <VouchPanel className="mt-12 grid gap-7 p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-[#1D4ED8] uppercase sm:text-base lg:text-lg">
          Ready to commit?
        </p>

        <h2 className="mt-4 font-(family-name:--font-display) text-[38px] leading-none tracking-[0.04em] text-white uppercase sm:text-[48px]">
          Back your next appointment with commitment.
        </h2>

        <p className="mt-4 max-w-170 text-base leading-[1.35] font-semibold text-neutral-400 sm:text-lg">
          Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.
        </p>
      </div>

      <Link
        href="/sign-up?return_to=/vouches/new"
        className={`${vouchPrimaryButtonClassName} min-w-72`}
      >
        <span className="translate-y-px">Create a Vouch</span>
        <ArrowRight className="size-5 sm:size-6" strokeWidth={1.9} />
      </Link>
    </VouchPanel>
  )
}
