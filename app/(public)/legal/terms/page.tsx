import { Handshake } from "lucide-react"

import { FAQSimpleList } from "@/components/public/faq-simple-list"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { termsSections } from "@/content/legal"
import { landingCalloutContent } from "@/content/marketing"

export default function TermsRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQSimpleList
        subtitle="Legal"
        title="Terms of Service"
        items={termsSections.map((section) => ({
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
