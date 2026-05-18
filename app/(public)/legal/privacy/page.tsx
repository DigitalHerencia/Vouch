import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { privacyCalloutContent, privacySections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Privacy Policy | Vouch",
  description:
    "Privacy policy for Vouch, including account, payment-provider, readiness, audit, and confirmation data handling.",
}

export default function PrivacyRoute() {
  const CalloutIcon = privacyCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        body="Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata."
        className="min-h-0"
        titleClassName="max-w-4xl text-[clamp(3rem,7vw,6rem)]"
      />
      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8">
        <ContentSectionList sections={privacySections} className="min-h-0" />
        <CalloutPanel
          className="self-start"
          icon={CalloutIcon}
          title={privacyCalloutContent.title}
          body={privacyCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              render={<Link href={privacyCalloutContent.action} />}
            >
              {privacyCalloutContent.label}
              <ArrowRight className="size-5" />
            </Button>
          }
        />
      </section>
    </main>
  )
}
