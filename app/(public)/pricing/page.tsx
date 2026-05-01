import { ArrowDown, ArrowRight } from "lucide-react"

import {
  VouchPrimaryLink,
  VouchSecondaryLink,
  vouchContainerClassName,
} from "@/components/brand/vouch-elements"
import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { PricingFlowPanel, PricingPanel } from "@/components/marketing/pricing-panel"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function PricingRoute() {
  return (
    <main>
      <div className={vouchContainerClassName}>
        <BrutalistPageHeader
          className="mt-12"
          title={
            <>
              Clear before
              <br />
              payment-backed
              <br />
              commitment
              <br />
              release.
            </>
          }
          body="Vouch charges a transparent platform fee before payment commitment. You always see the amount, platform fee, provider fee, and total before confirming."
          actions={
            <>
              <VouchPrimaryLink
                href="/sign-up?return_to=/vouches/new"
                icon={ArrowRight}
                className="w-full sm:w-auto sm:min-w-56"
              >
                Create a Vouch
              </VouchPrimaryLink>

              <VouchSecondaryLink
                href="/how-it-works"
                icon={ArrowDown}
                className="w-full sm:w-auto sm:min-w-56"
              >
                How it works
              </VouchSecondaryLink>
            </>
          }
        />
        <PricingFlowPanel />
      </div>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <PricingPanel />
        <PublicCtaPanel />
      </section>
    </main>
  )
}
