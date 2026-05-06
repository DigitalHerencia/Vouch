// app/(public)/legal/privacy/page.tsx

import { CtaPanel } from "@/components/shared/cta-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHeader } from "@/components/landing/landing-page-header"
import { privacySections } from "@/content/legal"

export default function PrivacyRoute() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
      />

      <ContentSectionList sections={privacySections} />
      <CtaPanel />
    </main>
  )
}
