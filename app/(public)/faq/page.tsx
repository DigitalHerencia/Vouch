import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQAccordion } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { faqCalloutContent, faqSections } from "@/content/faq"

export default function FaqRoute() {
  const CalloutIcon = faqCalloutContent.icon

  return (
    <main>
      <FAQAccordion
        subtitle="FAQ"
        title="Frequently Asked Questions"
        items={faqSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<CalloutIcon className="size-8" />}
        title={faqCalloutContent.title}
        description={faqCalloutContent.body}
        primaryAction={{ label: faqCalloutContent.label, href: faqCalloutContent.action }}
      />
    </main>
  )
}
