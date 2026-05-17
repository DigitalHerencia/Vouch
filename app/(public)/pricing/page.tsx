import { ArrowDown, ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  pricingCalloutContent,
  pricingFlowSteps,
  pricingNotes,
  pricingStats,
  PricingHeroContent,
} from "@/content/pricing"

export default function PricingPage() {
  const PricingCalloutIcon = pricingCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-3 md:gap-8">
      <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_34rem] md:gap-8">
        <PageHero
          title={PricingHeroContent.title}
          body={PricingHeroContent.body}
          className="flex min-h-0 border-2 border-neutral-100 bg-black p-5 shadow-[6px_6px_0_0_#1d4ed8] sm:p-6 md:p-8"
          contentClassName="flex h-full flex-col justify-center p-0"
          titleClassName="max-w-[9ch] text-[clamp(3.5rem,7vw,7rem)]"
          bodyClassName="max-w-xl"
          actions={
            <>
              <Button size="cta" render={<Link href="/sign-up?return_to=/vouches/new" />}>
                Create a Vouch
                <ArrowRight className="size-5" />
              </Button>
              <Button variant="secondary" size="cta" render={<Link href="#pricing-rule" />}>
                How it works
                <ArrowDown className="size-5" />
              </Button>
            </>
          }
        />
        <ProcessPanel
          title="Payment flow"
          steps={[...pricingFlowSteps]}
          footer="Both confirm = release"
        />
      </section>

      <section id="pricing-rule" className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
        <MetricGrid items={[...pricingStats]} className="min-h-0 lg:grid-cols-2" />
        <section className="grid min-h-0 gap-4">
          {pricingNotes.map((note) => (
            <Card key={note.title} className="border-2 border-neutral-100 bg-black">
              <CardContent>
                <SectionIntro
                  eyebrow={note.eyebrow}
                  title={note.title}
                  body={note.body}
                  titleClassName="text-[clamp(2rem,3.5vw,3.5rem)]"
                />
              </CardContent>
            </Card>
          ))}
        </section>
      </section>

      <CalloutPanel
        className="min-h-0"
        icon={PricingCalloutIcon}
        title={pricingCalloutContent.title}
        body={pricingCalloutContent.body}
        actions={
          <Button size="cta" render={<Link href={pricingCalloutContent.action} />}>
            {pricingCalloutContent.label}
            <ArrowRight className="size-5" />
          </Button>
        }
      />
    </main>
  )
}
