import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { PricingPanel } from "@/components/marketing/pricing-panel"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function PricingRoute() {
  return (
    <div className="px-6 py-10 sm:px-9 lg:px-10 lg:py-12">
      <BrutalistPageHeader
        eyebrow="Pricing"
        title="Clear before commitment"
        body="Vouch charges a transparent platform fee before payment commitment. You always see amount, fee, and total before confirming."
      />

      <PricingPanel />
      <PublicCtaPanel />
    </div>
  )
}
