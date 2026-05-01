import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { LegalSections } from "@/components/marketing/legal-sections"
import { privacySections } from "@/components/marketing/legal-content"

export default function PrivacyRoute() {
  return (
    <div className="px-6 py-10 sm:px-9 lg:px-10 lg:py-12">
      <BrutalistPageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
      />

      <LegalSections sections={privacySections} />
    </div>
  )
}
