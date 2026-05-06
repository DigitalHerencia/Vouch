// app/(public)/faq/page.tsx

import { CtaPanel } from "@/components/shared/cta-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { LandingPageHeader } from "@/components/landing/landing-page-header"
import { faqSections } from "@/content/faq"

export default function FaqRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <LandingPageHeader
        eyebrow="FAQ"
        title="Precise answers"
        body="Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, broker, or judge."
      />

      <ContentSectionList sections={faqSections} />
      <CtaPanel />
    </main>
  )
}
