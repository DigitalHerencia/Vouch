import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/shared/cta-section"
import { FAQSimpleList } from "@/components/public/faq-section"
import { privacySections } from "@/content/legal"
import { landingCalloutContent } from "@/content/marketing"
import { Handshake } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy | Vouch",
  description: "Privacy policy for Vouch accounts, payment coordination data, and provider flows.",
}

export default function PrivacyRoute() {
  return (
    <main>
      <FAQSimpleList
        subtitle="Legal"
        title="Privacy Policy"
        items={privacySections.map((section) => ({
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
