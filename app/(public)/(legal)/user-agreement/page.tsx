import type { Metadata } from "next"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FAQSimpleList } from "@/components/blocks/faq-section"
import { HeroMinimal } from "@/components/blocks/hero-section"
import { userAgreementCalloutContent, userAgreementSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "User Agreement | Vouch",
  description: "User agreement for Vouch accounts, provider flows, and confirmation conduct.",
}

export default function UserAgreementRoute() {
  const CalloutIcon = userAgreementCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 md:gap-12">
      <HeroMinimal
        title="User Agreement"
        description="Use Vouch only for explicit, lawful, pre-arranged commitments where the confirmation rule is understood before anyone commits."
      />
      <section className="grid min-h-0 gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQSimpleList
          title="Agreement"
          items={userAgreementSections.map((section) => ({
            question: section.heading,
            answer: section.body.join(" "),
          }))}
        />
        <CTAWithBackground
          icon={<CalloutIcon className="size-8" />}
          title={userAgreementCalloutContent.title}
          description={userAgreementCalloutContent.body}
          primaryAction={{
            label: userAgreementCalloutContent.label,
            href: userAgreementCalloutContent.action,
          }}
        />
      </section>
    </main>
  )
}
