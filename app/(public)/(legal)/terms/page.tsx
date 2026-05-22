import type { Metadata } from "next"

import { CTASection } from "@/components/blocks/cta-section"
import { FAQSection } from "@/components/blocks/faq-section"
import { HeroSection } from "@/components/blocks/hero-section"
import { termsCalloutContent, termsSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Terms | Vouch",
  description: "Terms for using Vouch as a narrow payment coordination system.",
}

export default function TermsRoute() {
  const CalloutIcon = termsCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroSection.Minimal
        title="Terms"
        description="Use Vouch only for explicit commitments where both participants understand the confirmation rule before payment commitment."
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSection.SimpleList
          title="Terms of Service"
          items={termsSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
        />
        <CTASection.WithBackground
          icon={<CalloutIcon className="size-8" />}
          title={termsCalloutContent.title}
          description={termsCalloutContent.body}
          primaryAction={{
            label: termsCalloutContent.label,
            href: termsCalloutContent.action,
          }}
        />
      </section>
    </main>
  )
}
