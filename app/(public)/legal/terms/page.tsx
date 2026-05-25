import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { termsCalloutContent, termsSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Terms | Vouch",
  description: "Terms for using Vouch as a narrow payment coordination system.",
}

export default function TermsRoute() {
  const CalloutIcon = termsCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroMinimal
        title="Terms"
        description="Use Vouch only for explicit commitments where both participants understand the confirmation rule before payment commitment."
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSimpleList
          title="Terms of Service"
          items={termsSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
        />
        <CTAWithBackground
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
