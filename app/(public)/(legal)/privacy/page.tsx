import type { Metadata } from "next"

import { CTASection } from "@/components/blocks/cta-section"
import { FAQSection } from "@/components/blocks/faq-section"
import { HeroSection } from "@/components/blocks/hero-section"
import { privacyCalloutContent, privacySections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Privacy | Vouch",
  description: "Privacy policy for Vouch accounts, payment coordination data, and provider flows.",
}

export default function PrivacyRoute() {
  const CalloutIcon = privacyCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroSection.Minimal
        title="Privacy"
        description="Vouch stores operational state needed to coordinate provider-backed payments and confirmation windows."
        className="px-0 py-0"
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSection.SimpleList
          title="Privacy Policy"
          items={privacySections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
          className="bg-transparent px-0 py-0"
        />
        <CTASection.WithBackground
          className="self-start px-0 py-0"
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
