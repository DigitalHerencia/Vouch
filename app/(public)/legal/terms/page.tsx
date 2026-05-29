import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { termsCalloutContent, termsSections } from "@/content/legal"
import { landingCalloutContent } from "@/content/marketing"
import { Handshake } from "lucide-react"

export default function TermsRoute() {
  const CalloutIcon = termsCalloutContent.icon

  return (
    <main>
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
    </main>
  )
}
