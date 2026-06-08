import { Handshake } from "lucide-react"

import { FAQAccordion } from "@/components/public/faq-accordion"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { faqSections } from "@/content/faq"
import { landingCalloutContent } from "@/content/marketing"

export default function FaqRoute() {
  return (
    <div className="grid gap-14 md:gap-18 lg:gap-24">
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
    </div>
  )
}
