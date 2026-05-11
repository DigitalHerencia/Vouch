// app/(public)/legal/terms/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { ContentSectionList } from "@/components/shared/content-section-list"
import { PageHero } from "@/components/shared/page-hero"
import { termsCalloutContent, termsSections } from "@/content/legal"

export default function TermsRoute() {
  const TermsCalloutIcon = termsCalloutContent.icon

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        body="Provider-backed payment coordination. Not marketplace. Not escrow. Not arbitration."
      />

      <ContentSectionList sections={termsSections} />
      <CalloutPanel
        className="mt-12"
        icon={TermsCalloutIcon}
        title={termsCalloutContent.title}
        body={termsCalloutContent.body}
        actions={
          <Button
            variant="primary"
            size="cta"
            className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
            render={<Link href={termsCalloutContent.action} />}
          >
            <span className="translate-y-px">{termsCalloutContent.label}</span>
            <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
          </Button>
        }
      />
    </main>
  )
}
