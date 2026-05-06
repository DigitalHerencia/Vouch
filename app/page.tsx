// app/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { LandingCalloutPanel } from "@/components/landing/landing-callout-panel"
import { LandingCardGrid } from "@/components/landing/landing-card-grid"
import { LandingMetricGrid } from "@/components/landing/landing-metric-grid"
import { LandingPageHeader } from "@/components/landing/landing-page-header"
import { LandingProcessPanel } from "@/components/landing/landing-process-panel"
import { LandingPublicFooter } from "@/components/landing/landing-public-footer"
import { LandingPublicHeader } from "@/components/landing/landing-public-header"
import { LandingSectionIntro } from "@/components/landing/landing-section-intro"
import { Button } from "@/components/ui/button"
import {
  landingFooterContent,
  landingHeaderContent,
  landingHeroActionsContent,
  landingHeroContent,
  landingMetrics,
  landingProcessPanelContent,
  landingProcessSteps,
  landingSectionIntroContent,
  landingTrustPanelContent,
  landingUseCases,
} from "@/content/marketing"

export default function HomePage() {
  const TrustIcon = landingTrustPanelContent.icon

  return (
    <main>
      <LandingPublicHeader content={landingHeaderContent} />

      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <header className="pt-2 lg:pt-8">
            <LandingPageHeader
              title={landingHeroContent.title}
              body={landingHeroContent.body}
              actions={
                <>
                  <Button
                    variant="primary"
                    size="cta"
                    className="min-w-62.5"
                    render={<Link href={landingHeroActionsContent.primary.href} />}
                  >
                    <span className="translate-y-px">
                      {landingHeroActionsContent.primary.label}
                    </span>
                    <ArrowRight className="size-6" strokeWidth={1.8} />
                  </Button>

                  <Button
                    variant="secondary"
                    size="cta"
                    className="min-w-55"
                    render={<Link href={landingHeroActionsContent.secondary.href} />}
                  >
                    <span className="translate-y-px">
                      {landingHeroActionsContent.secondary.label}
                    </span>
                    <ArrowDown className="size-5" strokeWidth={1.8} />
                  </Button>
                </>
              }
            />
          </header>

          <div id="process" className="mx-auto w-full max-w-130 scroll-mt-28 lg:pt-6">
            <LandingProcessPanel
              title={landingProcessPanelContent.title}
              steps={landingProcessSteps}
              footer={landingProcessPanelContent.footer}
              className="blue"
            />
          </div>
        </div>

        <LandingMetricGrid items={landingMetrics} className="mt-14" />

        <section className="mt-16">
          <LandingSectionIntro
            eyebrow={landingSectionIntroContent.eyebrow}
            title={landingSectionIntroContent.title}
            body={landingSectionIntroContent.body}
          />

          <LandingCardGrid items={landingUseCases} className="mt-9" />

          <LandingCalloutPanel
            className="mt-10"
            icon={TrustIcon}
            title={landingTrustPanelContent.title}
            body={landingTrustPanelContent.body}
            actions={
              <Button
                variant="primary"
                size="cta"
                className="min-w-72"
                render={<Link href={landingTrustPanelContent.action.href} />}
              >
                <span className="translate-y-px">
                  {landingTrustPanelContent.action.label}
                </span>
                <ArrowRight className="size-5 sm:size-6" strokeWidth={1.9} />
              </Button>
            }
          />
        </section>
      </section>

      <LandingPublicFooter content={landingFooterContent} />
    </main>
  )
}