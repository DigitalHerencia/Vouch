// app/(public)/legal/terms/page.tsx

import { termsSections } from "@/components/marketing/legal-content"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHeader } from "@/components/shared/page-header"

export default function TermsRoute() {
    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
            <PageHeader
                eyebrow="Legal"
                title="Terms of Service"
                body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration."
            />

            <ContentSectionList sections={termsSections} />
            <PublicCtaPanel />
        </main>
    )
}
