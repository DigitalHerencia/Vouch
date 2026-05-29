import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQAccordion } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { faqCalloutContent, faqSections } from "@/content/faq"
import { Handshake } from "lucide-react"
import { landingCalloutContent } from "@/content/marketing"

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
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={landingCalloutContent.title}
        description={landingCalloutContent.body}
        primaryAction={{
          label: landingCalloutContent.label,
          href: landingCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </main>
  )
}
