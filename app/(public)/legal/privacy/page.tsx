// app/(public)/legal/privacy/page.tsx

import { privacySections } from "@/components/marketing/legal-content"
import { PublicCtaPanel } from "@/components/marketing/public-cta-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHeader } from "@/components/shared/page-header"

export default function PrivacyRoute() {
    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
            <PageHeader
                eyebrow="Legal"
                title="Privacy Policy"
                body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
            />

            <ContentSectionList sections={privacySections} />
            <PublicCtaPanel />
        </main>
    )
}
