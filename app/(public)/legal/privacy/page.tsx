// app/(public)/legal/privacy/page.tsx

import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { privacySections } from "@/components/marketing/legal-content"
import { LegalSections } from "@/components/marketing/legal-sections"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"

export default function PrivacyRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <BrutalistPageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
      />

      <LegalSections sections={privacySections} />
      <PublicCtaPanel />
    </main>
  )
}
