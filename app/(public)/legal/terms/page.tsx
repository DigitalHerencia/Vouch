// app/(public)/legal/terms/page.tsx

import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { termsSections } from "@/components/marketing/legal-content"
import { LegalSections } from "@/components/marketing/legal-sections"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function TermsRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <BrutalistPageHeader
        eyebrow="Legal"
        title="Terms of Service"
        body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration."
      />

      <LegalSections sections={termsSections} />
      <PublicCtaPanel />
    </main>
  )
}
