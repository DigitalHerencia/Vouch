import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { privacyCalloutContent, privacySections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Privacy | Vouch",
  description: "Privacy policy for Vouch accounts, payment coordination data, and provider flows.",
}

export default function PrivacyRoute() {
  const CalloutIcon = privacyCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroMinimal
        title="Privacy"
        description="Vouch stores operational state needed to coordinate provider-backed payments and confirmation windows."
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSimpleList
          title="Privacy Policy"
          items={privacySections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
        />
        <CTAWithBackground
          icon={<CalloutIcon className="size-8" />}
          title={privacyCalloutContent.title}
          description={privacyCalloutContent.body}
          primaryAction={{
            label: privacyCalloutContent.label,
            href: privacyCalloutContent.action,
          }}
        />
      </section>
    </main>
  )
}
