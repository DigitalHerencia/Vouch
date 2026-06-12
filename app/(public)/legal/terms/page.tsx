import { Handshake } from "lucide-react"

import { FAQSimpleList } from "@/components/public/faq-simple-list"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { legalPageContent, termsCalloutContent, termsSections } from "@/content/legal"

export default function TermsRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQSimpleList
        subtitle={legalPageContent.eyebrow}
        title={legalPageContent.termsTitle}
        items={termsSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={termsCalloutContent.title}
        description={termsCalloutContent.body}
        primaryAction={{
          label: termsCalloutContent.label,
          href: termsCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
