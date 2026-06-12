import { Handshake } from "lucide-react"

import { FAQSimpleList } from "@/components/public/faq-simple-list"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { disclaimerCalloutContent, disclaimerSections, legalPageContent } from "@/content/legal"

export default function DisclaimerRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQSimpleList
        subtitle={legalPageContent.eyebrow}
        title={legalPageContent.disclaimerTitle}
        items={disclaimerSections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={disclaimerCalloutContent.title}
        description={disclaimerCalloutContent.body}
        primaryAction={{
          label: disclaimerCalloutContent.label,
          href: disclaimerCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
