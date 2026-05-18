import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { disclaimerCalloutContent, disclaimerSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Disclaimer | Vouch",
  description:
    "Important boundaries for Vouch payment coordination, confirmation rules, and non-dispute operation.",
}

export default function DisclaimerRoute() {
  const CalloutIcon = disclaimerCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <PageHero
        eyebrow="Disclaimer"
        title="Bounded by state"
        body="Vouch coordinates provider-backed payments through explicit commitments and dual confirmation. It does not arbitrate human disputes."
        className="min-h-0"
        titleClassName="max-w-4xl text-[clamp(3rem,7vw,6rem)]"
      />
      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8">
        <ContentSectionList sections={disclaimerSections} className="min-h-0" />
        <CalloutPanel
          className="self-start"
          icon={CalloutIcon}
          title={disclaimerCalloutContent.title}
          body={disclaimerCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              render={<Link href={disclaimerCalloutContent.action} />}
            >
              {disclaimerCalloutContent.label}
              <ArrowRight className="size-5" />
            </Button>
          }
        />
      </section>
    </main>
  )
}
