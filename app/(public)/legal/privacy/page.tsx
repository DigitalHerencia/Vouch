import { Handshake } from "lucide-react"
import type { Metadata } from "next"

import { FAQSimpleList } from "@/components/public/faq-simple-list"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { legalPageContent, privacyCalloutContent, privacySections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Privacy | Vouch",
  description: "Privacy policy for Vouch accounts, payment coordination data, and provider flows.",
}

export default function PrivacyRoute() {
  return (
    <div className="grid gap-14 md:gap-16 lg:gap-24">
      <FAQSimpleList
        subtitle={legalPageContent.eyebrow}
        title={legalPageContent.privacyTitle}
        items={privacySections.map((section) => ({
          question: section.heading,
          answer: section.body.join(" "),
        }))}
      />
      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={privacyCalloutContent.title}
        description={privacyCalloutContent.body}
        primaryAction={{
          label: privacyCalloutContent.label,
          href: privacyCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
