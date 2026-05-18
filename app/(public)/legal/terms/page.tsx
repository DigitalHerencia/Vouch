import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { termsCalloutContent, termsSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Terms of Service | Vouch",
  description:
    "Terms for Vouch, a rule-bound payment coordination system for commitment-backed appointments.",
}

export default function TermsRoute() {
  const CalloutIcon = termsCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        body="Provider-backed payment coordination with deterministic confirmation rules and hosted Stripe payment flows."
        className="min-h-0"
        titleClassName="max-w-4xl text-[clamp(3rem,7vw,6rem)]"
      />
      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8">
        <ContentSectionList sections={termsSections} className="min-h-0" />
        <CalloutPanel
          className="self-start"
          icon={CalloutIcon}
          title={termsCalloutContent.title}
          body={termsCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              render={<Link href={termsCalloutContent.action} />}
            >
              {termsCalloutContent.label}
              <ArrowRight className="size-5" />
            </Button>
          }
        />
      </section>
    </main>
  )
}
