// app/(public)/legal/privacy/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { privacyCalloutContent, privacySections } from "@/content/legal"

export default function PrivacyRoute() {
  const PrivacyCalloutIcon = privacyCalloutContent.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
      />

      <ContentSectionList sections={privacySections} />
      <CalloutPanel
        className="mt-12"
        icon={PrivacyCalloutIcon}
        title={privacyCalloutContent.title}
        body={privacyCalloutContent.body}
        actions={
          <Button
            variant="primary"
            size="cta"
            className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
            render={<Link href={privacyCalloutContent.action} />}
          >
            <span className="translate-y-px">{privacyCalloutContent.label}</span>
            <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
          </Button>
        }
      />
    </main>
  )
}
