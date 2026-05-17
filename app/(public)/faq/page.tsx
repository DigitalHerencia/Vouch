import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { faqCalloutContent, faqSections } from "@/content/faq"

export const metadata: Metadata = {
  title: "FAQ | Vouch",
  description:
    "Answers about how Vouch coordinates commitment-backed payments through deterministic confirmation state.",
}

export default function FaqRoute() {
  const CalloutIcon = faqCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <PageHero
        eyebrow="FAQ"
        title="Precise answers"
        body="Vouch is the commitment layer for deterministic confirmation and provider-backed payment coordination."
        className="min-h-0 border-2 border-neutral-100 bg-black p-5 shadow-[6px_6px_0_0_#1d4ed8] sm:p-6 md:p-8"
        contentClassName="p-0"
        titleClassName="max-w-4xl text-[clamp(3rem,7vw,6rem)]"
      />

      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8">
        <ContentSectionList sections={faqSections} className="min-h-0" />
        <CalloutPanel
          className="self-start"
          icon={CalloutIcon}
          title={faqCalloutContent.title}
          body={faqCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              render={<Link href={faqCalloutContent.action} />}
            >
              <span className="translate-y-px">{faqCalloutContent.label}</span>
              <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
            </Button>
          }
        />
      </section>
    </main>
  )
}
