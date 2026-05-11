// app/(public)/faq/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { faqCalloutContent, faqSections } from "@/content/faq"

export default function FaqRoute() {
  const FaqCalloutIcon = faqCalloutContent.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero
        eyebrow="FAQ"
        title="Precise answers"
        body="Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, broker, or judge."
      />

      <ContentSectionList sections={faqSections} />
      <CalloutPanel
        className="mt-12"
        icon={FaqCalloutIcon}
        title={faqCalloutContent.title}
        body={faqCalloutContent.body}
        actions={
          <Button
            variant="primary"
            size="cta"
            className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
            render={<Link href={faqCalloutContent.action} />}
          >
            <span className="translate-y-px">{faqCalloutContent.label}</span>
            <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
          </Button>
        }
      />
    </main>
  )
}
