// app/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { PublicShell } from "@/components/navigation/public-shell"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { CardGrid } from "@/components/shared/card-grid"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import {
  landingHeroContent,
  landingMetrics,
  landingProcessSteps,
  landingProcessPanelContent,
  landingTrustPanelContent,
  landingUseCases,
  landingSectionIntroContent,
  landingHeroActionsContent,
} from "@/content/marketing"

export default function HomePage() {
  const TrustIcon = landingTrustPanelContent.icon

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <header className="pt-2 lg:pt-8">
            <PageHero
              title={landingHeroContent.title}
              body={landingHeroContent.body}
              actions={
                <>
                  <Button
                    variant="primary"
                    size="cta"
                    className="min-w-62.5"
                    render={<Link href="/sign-up?return_to=/vouches/new" />}
                  >
                    <span className="translate-y-px">Get Started</span>
                    <ArrowRight className="size-6" strokeWidth={1.8} />
                  </Button>

                  <Button
                    variant="secondary"
                    size="cta"
                    className="min-w-55"
                    render={<Link href="#callout" />}
                  >
                    <span className="translate-y-px">
                      {landingHeroActionsContent.secondaryLabel}
                    </span>
                    <ArrowDown className="size-5" strokeWidth={1.8} />
                  </Button>
                </>
              }
            />
          </header>

          <div id="process" className="mx-auto w-full max-w-130 scroll-mt-28 lg:pt-6">
            <ProcessPanel
              title={landingProcessPanelContent.title}
              steps={landingProcessSteps}
              footer={landingProcessPanelContent.footer}
              className="blue"
            />
          </div>
        </div>

        <MetricGrid items={landingMetrics} className="mt-14" />

        <section className="mt-16">
          <SectionIntro
            eyebrow={landingSectionIntroContent.eyebrow}
            title={landingSectionIntroContent.title}
            body={landingSectionIntroContent.body}
          />

          <CardGrid items={landingUseCases} className="mt-9" />

          <CalloutPanel
            className="mt-10"
            icon={TrustIcon}
            title={landingTrustPanelContent.title}
            body={landingTrustPanelContent.body}
            actions={
              <Button
                variant="primary"
                size="cta"
                className="min-w-72"
                render={<Link href={landingTrustPanelContent.action} />}
              >
                <span className="translate-y-px">{landingTrustPanelContent.label}</span>
                <ArrowRight className="size-5 sm:size-6" strokeWidth={1.9} />
              </Button>
            }
          />
        </section>
      </section>
    </PublicShell>
  )
}
