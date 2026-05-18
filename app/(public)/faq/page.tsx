import type { Metadata } from "next"

import { CTASection } from "@/components/blocks/cta-section"
import { FAQSection } from "@/components/blocks/faq-section"
import { HeroSection } from "@/components/blocks/hero-section"
import { faqCalloutContent, faqSections } from "@/content/faq"

export const metadata: Metadata = {
  title: "FAQ | Vouch",
  description:
    "Answers about how Vouch coordinates commitment-backed payments through deterministic confirmation state.",
}

export default function FaqRoute() {
  const CalloutIcon = faqCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroSection.Minimal
        title="Precise answers"
        description="Vouch is the commitment layer for deterministic confirmation and provider-backed payment coordination."
        className="px-0 py-0"
      />

      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSection.Accordion
          subtitle="FAQ"
          items={faqSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
          className="px-0 py-0"
        />
        <CTASection.WithBackground
          className="self-start px-0 py-0"
          icon={<CalloutIcon className="size-8" />}
          title={faqCalloutContent.title}
          description={faqCalloutContent.body}
          primaryAction={{ label: faqCalloutContent.label, href: faqCalloutContent.action }}
        />
      </section>
    </main>
  )
}
