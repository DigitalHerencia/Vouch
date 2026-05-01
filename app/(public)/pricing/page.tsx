// app/(public)/pricing/page.tsx

import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { PaymentFlowPanel } from "@/components/marketing/payment-flow-panel"
import { PricingPanel } from "@/components/marketing/pricing-panel"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function PricingRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <section className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="mx-auto w-full max-w-130 lg:pt-6">
          <PaymentFlowPanel />
        </div>

        <div className="pt-2 lg:pt-8">
          <BrutalistPageHeader
            eyebrow="Pricing"
            title="Clear before commitment"
            body="Vouch charges a transparent platform fee before payment commitment. You always see amount, fee, and total before confirming."
            align="right"
          />
        </div>
      </section>

      <PricingPanel />
      <PublicCtaPanel />
    </main>
  )
}
