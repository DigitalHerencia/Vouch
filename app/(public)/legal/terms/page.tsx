import type { Metadata } from "next"

import { CTASection } from "@/components/blocks/cta-section"
import { FAQSection } from "@/components/blocks/faq-section"
import { HeroSection } from "@/components/blocks/hero-section"
import { termsCalloutContent, termsSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Terms of Service | Vouch",
  description:
    "Terms for Vouch, a rule-bound payment coordination system for commitment-backed appointments.",
}

export default function TermsRoute() {
  const CalloutIcon = termsCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroSection.Minimal
        title="Terms of Service"
        description="Provider-backed payment coordination with deterministic confirmation rules and hosted Stripe payment flows."
        className="px-0 py-0"
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSection.SimpleList
          title="Legal"
          items={termsSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
          className="bg-transparent px-0 py-0"
        />
        <CTASection.WithBackground
          className="self-start px-0 py-0"
          icon={<CalloutIcon className="size-8" />}
          title={termsCalloutContent.title}
          description={termsCalloutContent.body}
          primaryAction={{ label: termsCalloutContent.label, href: termsCalloutContent.action }}
        />
      </section>
    </main>
  )
}
