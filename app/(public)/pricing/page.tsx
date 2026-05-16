import { ArrowDown, ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pricingCalloutContent, pricingFlowSteps, pricingNotes, pricingStats, PricingHeroContent } from "@/content/pricing"

export default function PricingPage() {
  const PricingCalloutIcon = pricingCalloutContent.icon
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <section className="space-y-14">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_34rem] lg:gap-14 xl:gap-18">
        <PageHero
          title={PricingHeroContent.title}
          body={PricingHeroContent.body}
          className="border-0 bg-transparent shadow-none"
          contentClassName="p-0"
          titleClassName="max-w-[9ch] text-[clamp(4.75rem,7vw,7.4rem)] leading-[0.86]"
          bodyClassName="max-w-xl"
          actions={
            <>
              <Button size="cta" render={<Link href="/sign-up?return_to=/vouches/new" />}>Create a Vouch<ArrowRight className="size-5" /></Button>
              <Button variant="secondary" size="cta" render={<Link href="#pricing-rule" />}>How it works<ArrowDown className="size-5" /></Button>
            </>
          }
        />
        <ProcessPanel title="Payment flow" steps={[...pricingFlowSteps]} footer="Both confirm = release" />
      </div>
      <section id="pricing-rule" className="space-y-10">
        <MetricGrid items={[...pricingStats]} />
        <section className="grid gap-4 lg:grid-cols-3">
          {pricingNotes.map((note) => <Card key={note.title} className="rounded-none border-neutral-800 bg-black"><CardContent><SectionIntro eyebrow={note.eyebrow} title={note.title} body={note.body} /></CardContent></Card>)}
        </section>
      </section>
      <CalloutPanel icon={PricingCalloutIcon} title={pricingCalloutContent.title} body={pricingCalloutContent.body} actions={<Button size="cta" render={<Link href={pricingCalloutContent.action} />}>{pricingCalloutContent.label}<ArrowRight className="size-5" /></Button>} />
      </section>
    </main>
  )
}
