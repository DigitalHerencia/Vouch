import { Handshake } from "lucide-react"

import { FAQAccordion } from "@/components/public/faq-accordion"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { faqCalloutContent, faqPageContent, faqSections } from "@/content/faq"

export default function FaqRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQAccordion
        subtitle={faqPageContent.eyebrow}
        title={faqPageContent.title}
        description={faqPageContent.description}
        items={faqSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={faqCalloutContent.title}
        description={faqCalloutContent.body}
        primaryAction={{
          label: faqCalloutContent.label,
          href: faqCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
