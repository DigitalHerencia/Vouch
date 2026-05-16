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
    "Answers about how Vouch coordinates commitment-backed payments without acting as a marketplace, broker, scheduler, escrow provider, or dispute-resolution service.",
}

export default function FaqRoute() {
  const CalloutIcon = faqCalloutContent.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly"
        body="Vouch coordinates commitment-backed payment outcomes through fixed protocol state. It does not browse, match, schedule, mediate, arbitrate, rate, review, or manually decide who is right."
        className="max-w-4xl"
        titleClassName="max-w-4xl text-[48px] leading-[0.92] tracking-[-0.06em] sm:text-[68px] lg:text-[88px]"
        bodyClassName="max-w-3xl text-[17px] leading-[1.45] sm:text-[19px]"
      />

      <div className="mt-12 border-t border-neutral-800 pt-8">
        <ContentSectionList sections={faqSections} />
      </div>

      <CalloutPanel
        className="mt-12"
        icon={CalloutIcon}
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
