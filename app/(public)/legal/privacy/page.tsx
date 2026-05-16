import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { privacyCalloutContent, privacySections } from "@/content/legal"

export const metadata: Metadata = {
  title: "Privacy Policy | Vouch",
  description:
    "Privacy policy for Vouch, including account, payment-provider, readiness, audit, and confirmation data handling.",
}

export default function PrivacyRoute() {
  const CalloutIcon = privacyCalloutContent.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero
        eyebrow="Privacy Policy"
        title="Minimal data for deterministic coordination"
        body="Vouch collects the account, provider, readiness, confirmation, timestamp, and audit information needed to operate the protocol. It does not sell personal data or build public discovery profiles."
        className="max-w-4xl"
        titleClassName="max-w-4xl text-[48px] leading-[0.92] tracking-[-0.06em] sm:text-[68px] lg:text-[88px]"
        bodyClassName="max-w-3xl text-[17px] leading-[1.45] sm:text-[19px]"
      />

      <div className="mt-12 border-t border-neutral-800 pt-8">
        <ContentSectionList sections={privacySections} />
      </div>

      <CalloutPanel
        className="mt-12"
        icon={CalloutIcon}
        title={privacyCalloutContent.title}
        body={privacyCalloutContent.body}
        actions={
          <Button
            variant="primary"
            size="cta"
            className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
            render={<Link href={privacyCalloutContent.action} />}
          >
            <span className="translate-y-px">{privacyCalloutContent.label}</span>
            <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
          </Button>
        }
      />
    </main>
  )
}
