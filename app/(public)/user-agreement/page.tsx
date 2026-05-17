import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { userAgreementCalloutContent, userAgreementSections } from "@/content/legal"

export const metadata: Metadata = {
  title: "User Agreement | Vouch",
  description: "User agreement for Vouch accounts, provider flows, and confirmation conduct.",
}

export default function UserAgreementRoute() {
  const CalloutIcon = userAgreementCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-4 md:gap-8">
      <PageHero
        eyebrow="Agreement"
        title="User Agreement"
        body="Use Vouch only for explicit, lawful, pre-arranged commitments where the confirmation rule is understood before anyone commits."
        className="min-h-0 border-2 border-neutral-100 bg-black p-5 shadow-[6px_6px_0_0_#1d4ed8] sm:p-6 md:p-8"
        contentClassName="p-0"
        titleClassName="max-w-4xl text-[clamp(3rem,7vw,6rem)]"
      />
      <section className="grid min-h-0 gap-4 sm:gap-6 md:row-span-3 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8">
        <ContentSectionList sections={userAgreementSections} className="min-h-0" />
        <CalloutPanel
          className="self-start"
          icon={CalloutIcon}
          title={userAgreementCalloutContent.title}
          body={userAgreementCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full"
              render={<Link href={userAgreementCalloutContent.action} />}
            >
              {userAgreementCalloutContent.label}
              <ArrowRight className="size-5" />
            </Button>
          }
        />
      </section>
    </main>
  )
}
