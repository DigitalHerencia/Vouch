import { ArrowDown, ArrowRight } from "lucide-react"
import Link from "next/link"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import {
  pricingCalloutContent,
  pricingFlowSteps,
  pricingNotes,
  pricingStats,
  PricingHeroContent,
} from "@/content/pricing"

export function PricingPage() {
  const PricingCalloutIcon = pricingCalloutContent.icon

  return (
    <main>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <header className="pt-2 lg:pt-8">
            <PageHero
              title={PricingHeroContent.title}
              body={PricingHeroContent.body}
              actions={
                <>
                  <Button
                    variant="primary"
                    size="cta"
                    className="min-w-62.5"
                    render={<Link href="/sign-up?return_to=/vouches/new" />}
                  >
                    <span className="translate-y-px">Create a Vouch</span>
                    <ArrowRight className="size-6" strokeWidth={1.8} />
                  </Button>

                  <Button
                    variant="secondary"
                    size="cta"
                    className="min-w-55"
                    render={<Link href="#process" />}
                  >
                    <span className="translate-y-px">How it works</span>
                    <ArrowDown className="size-5" strokeWidth={1.8} />
                  </Button>
                </>
              }
            />
          </header>

          <div className="mx-auto flex w-full max-w-130 scroll-mt-28 lg:pt-6">
            <ProcessPanel
              title="Payment flow"
              steps={pricingFlowSteps}
              footer="Both confirm = release"
              className="flex w-full flex-col lg:min-h-140"
            />
          </div>
        </div>

        <div id="pricing-rule" className="scroll-mt-28">
          <section className="mt-14 grid gap-12">
            <MetricGrid items={pricingStats} />

            <section className="grid divide-y divide-neutral-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {pricingNotes.map((note) => (
                <article
                  key={note.title}
                  className="grid min-h-84 grid-rows-[auto_112px_1fr] py-8 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
                >
                  <SectionIntro
                    eyebrow={note.eyebrow}
                    title={note.title}
                    body={note.body}
                    titleClassName="max-w-90 text-[34px] sm:text-[42px]"
                    bodyClassName="max-w-95 text-[17px]"
                  />
                </article>
              ))}
            </section>
          </section>
        </div>

        <CalloutPanel
          className="mt-12"
          icon={PricingCalloutIcon}
          title={pricingCalloutContent.title}
          body={pricingCalloutContent.body}
          actions={
            <Button
              variant="primary"
              size="cta"
              className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto lg:min-w-60"
              render={<Link href={pricingCalloutContent.action} />}
            >
              <span className="translate-y-px">{pricingCalloutContent.label}</span>
              <ArrowRight className="size-5 shrink-0" strokeWidth={1.9} />
            </Button>
          }
        />
      </section>
    </main>
  )
}
