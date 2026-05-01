import { ArrowRight } from "lucide-react"

import { VouchPrimaryLink, VouchPanel } from "@/components/brand/vouch-elements"

export function PublicCtaPanel() {
  return (
    <VouchPanel className="mt-12 grid gap-7 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
      <div>
        <h2 className="font-(family-name:--font-display) text-[36px] leading-none tracking-[0.04em] text-white uppercase sm:text-[44px] lg:text-[52px]">
          Back your next appointment with commitment.
        </h2>

        <p className="mt-4 max-w-175 text-[17px] leading-[1.35] font-semibold text-neutral-400">
          Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.
        </p>
      </div>

      <VouchPrimaryLink
        href="/sign-up?return_to=/vouches/new"
        icon={ArrowRight}
        className="w-full sm:w-auto lg:min-w-60"
      >
        Create a Vouch
      </VouchPrimaryLink>
    </VouchPanel>
  )
}
