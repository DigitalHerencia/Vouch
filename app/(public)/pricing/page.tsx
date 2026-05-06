// app/(public)/pricing/page.tsx

import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CtaPanel } from "@/components/shared/cta-panel"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PageHeader } from "@/components/shared/page-header"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { pricingFlowSteps, pricingNotes, pricingStats, pricingHeroContent } from "@/content/pricing"

export default function PricingRoute() {
  return (
    <main>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <header className="pt-2 lg:pt-8">
            <PageHeader
              title={pricingHeroContent.title}
              body={pricingHeroContent.body}
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

        <CtaPanel
          title="Create with the total already visible."
          body="Set the amount, show the fees, share the Vouch, and let the confirmation rule handle the outcome."
        />
      </section>
    </main>
  )
}
