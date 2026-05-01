import { BrutalistPageHeader } from "@/components/marketing/brutalist-page-header"
import { LegalSections } from "@/components/marketing/legal-sections"
import { termsSections } from "@/components/marketing/legal-content"

export default function TermsRoute() {
  return (
    <div className="px-6 py-10 sm:px-9 lg:px-10 lg:py-12">
      <BrutalistPageHeader
        eyebrow="Legal"
        title="Terms of Service"
        body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration."
      />

      <LegalSections sections={termsSections} />
    </div>
  )
}
