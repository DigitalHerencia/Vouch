// app/(public)/legal/terms/page.tsx

import { CtaPanel } from "@/components/shared/cta-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { LandingPageHeader } from "@/components/landing/landing-page-header"
import { termsSections } from "@/content/legal"

export default function TermsRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <LandingPageHeader
        eyebrow="Legal"
        title="Terms of Service"
        body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration."
      />

      <ContentSectionList sections={termsSections} />
      <CtaPanel />
    </main>
  )
}
