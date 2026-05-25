import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { disclaimerCalloutContent, disclaimerSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Disclaimer | Vouch",
  description:
    "Important boundaries for Vouch payment coordination, confirmation rules, and non-dispute operation.",
}

export default function DisclaimerRoute() {
  const CalloutIcon = disclaimerCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroMinimal
        title="Bounded by state"
        description="Vouch coordinates provider-backed payments through explicit commitments and dual confirmation. It does not arbitrate human disputes."
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSimpleList
          title="Disclaimer"
          items={disclaimerSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
        />
        <CTAWithBackground
          icon={<CalloutIcon className="size-8" />}
          title={disclaimerCalloutContent.title}
          description={disclaimerCalloutContent.body}
          primaryAction={{
            label: disclaimerCalloutContent.label,
            href: disclaimerCalloutContent.action,
          }}
        />
      </section>
    </main>
  )
}
