import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { Button } from "@/components/ui/button"
import { faqCalloutContent, faqSections } from "@/content/faq"
import {
  privacyCalloutContent,
  privacySections,
  termsCalloutContent,
  termsSections,
} from "@/content/legal"

type LegalPageKind = "faq" | "terms" | "privacy"

const pages = {
  faq: {
    eyebrow: "FAQ",
    title: "Precise answers",
    body: "Vouch is the commitment layer, not a marketplace, scheduler, escrow provider, broker, or judge.",
    sections: faqSections,
    callout: faqCalloutContent,
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    body: "Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration.",
    sections: termsSections,
    callout: termsCalloutContent,
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    body: "Vouch minimizes data collection and stores provider references, statuses, timestamps, and audit-safe metadata.",
    sections: privacySections,
    callout: privacyCalloutContent,
  },
} as const

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const page = pages[kind]
  const CalloutIcon = page.callout.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero eyebrow={page.eyebrow} title={page.title} body={page.body} />

      <ContentSectionList sections={page.sections} />
      <CalloutPanel
        className="mt-12"
        icon={CalloutIcon}
        title={page.callout.title}
        body={page.callout.body}
        actions={
          <Button
            variant="primary"
            size="cta"
            className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
            render={<Link href={page.callout.action} />}
          >
            <span className="translate-y-px">{page.callout.label}</span>
            <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
          </Button>
        }
      />
    </main>
  )
}
