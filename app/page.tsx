import {
  ArrowDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"

import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid, type MetricGridItem } from "@/components/shared/metric-grid"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel, type ProcessPanelStep } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  landingHeroActionsContent,
  landingTrustPanelContent,
} from "@/content/marketing"
import {
  PricingHeroContent,
  pricingFlowSteps,
  pricingNotes,
  pricingStats,
} from "@/content/pricing"

export default function LandingPage() {
  const metrics: MetricGridItem[] = [...pricingStats]
  const processSteps: ProcessPanelStep[] = [...pricingFlowSteps]

  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 sm:py-18 lg:px-12 lg:py-20">
        <section className="space-y-12 lg:space-y-14">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_34rem] lg:gap-14 xl:gap-18">
            <PageHero
              title={PricingHeroContent.title}
              body={PricingHeroContent.body}
              className="border-0 bg-transparent shadow-none"
              contentClassName="p-0"
              titleClassName="max-w-[9.25ch] text-[clamp(4.75rem,7vw,7.4rem)] leading-[0.86]"
              bodyClassName="max-w-xl"
              actions={
                <>
                  <Button
                    variant="primary"
                    size="cta"
                    render={<Link href="/sign-up?return_to=/vouches/new" />}
                  >
                    {landingHeroActionsContent.primaryLabel}
                    <ArrowRight className="size-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="cta"
                    render={<Link href="#process" />}
                  >
                    {landingHeroActionsContent.secondaryLabel}
                    <ArrowDown className="size-5" />
                  </Button>
                </>
              }
            />

            <ProcessPanel
              id="process"
              title="Payment flow"
              steps={processSteps}
              footer="Both confirm = release"
            />
          </div>

          <MetricGrid items={metrics} />

          <section className="grid gap-4 lg:grid-cols-3">
            {pricingNotes.map((note) => (
              <Card key={note.title} className="rounded-none border-neutral-800 bg-black/80">
                <CardContent>
                  <SectionIntro eyebrow={note.eyebrow} title={note.title} body={note.body} />
                </CardContent>
              </Card>
            ))}
          </section>

          <CalloutPanel
            icon={ShieldCheck}
            title={landingTrustPanelContent.title}
            body={landingTrustPanelContent.body}
            actions={
              <Button
                variant="primary"
                size="cta"
                render={<Link href={landingTrustPanelContent.action} />}
              >
                {landingTrustPanelContent.label}
                <ArrowRight className="size-5" />
              </Button>
            }
          />
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
