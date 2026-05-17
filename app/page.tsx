import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  LockKeyhole,
  MoreHorizontal,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react"
import Link from "next/link"

import { CardGrid } from "@/components/shared/card-grid"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { MetricGrid } from "@/components/shared/metric-grid"
import { PublicShell } from "@/components/navigation/public-shell"
import { PageHero } from "@/components/shared/page-hero"
import { ProcessPanel } from "@/components/shared/process-panel"
import { SectionIntro } from "@/components/shared/section-intro"
import { Button } from "@/components/ui/button"
import {
  landingHeroActionsContent,
  landingHeroContent,
  landingMetrics,
  landingProcessPanelContent,
  landingProcessSteps,
  landingSectionIntroContent,
  landingTrustPanelContent,
  landingUseCases,
} from "@/content/marketing"

const processIcons = [FilePenLine, UsersRound, CheckCircle2, LockKeyhole] as const
const useCaseIcons = [CalendarDays, UsersRound, Wrench, MoreHorizontal] as const

export default function LandingPage() {
  return (
    <PublicShell>
      <main className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-7xl grid-rows-none gap-4 px-4 py-4 sm:gap-6 sm:px-6 md:grid-rows-3 md:gap-8 md:px-8 md:py-8">
        <section className="grid min-h-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          <PageHero
            title={landingHeroContent.title}
            body={landingHeroContent.body}
            className="flex min-h-0 border-2 border-neutral-100 bg-black p-5 shadow-[6px_6px_0_0_#1d4ed8] sm:p-6 md:p-8"
            contentClassName="flex h-full flex-col justify-center p-0"
            titleClassName="max-w-[10ch] text-[clamp(3.5rem,7vw,7rem)]"
            actions={
              <>
                <Button
                  variant="primary"
                  size="cta"
                  className="w-full justify-center sm:w-56"
                  render={<Link href="/sign-up?return_to=/vouches/new" />}
                >
                  {landingHeroActionsContent.primaryLabel}
                  <ArrowRight className="size-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="cta"
                  className="w-full justify-center sm:w-56"
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
            title={landingProcessPanelContent.title}
            steps={landingProcessSteps.map((step, index) => ({
              ...step,
              icon: processIcons[index] ?? FilePenLine,
            }))}
            footer={landingProcessPanelContent.footer}
            className="min-h-0"
          />
        </section>

        <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-[1.1fr_0.9fr] md:gap-8">
          <MetricGrid items={[...landingMetrics]} className="min-h-0 lg:grid-cols-2" />
          <section className="flex min-h-0 border-2 border-neutral-100 bg-black p-5 shadow-[6px_6px_0_0_#1d4ed8] sm:p-6 md:p-8">
            <SectionIntro
              eyebrow={landingSectionIntroContent.eyebrow}
              title={landingSectionIntroContent.title}
              body={landingSectionIntroContent.body}
              className="flex h-full flex-col justify-center"
              titleClassName="text-[clamp(2.75rem,5vw,4.4rem)]"
            />
          </section>
        </section>

        <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          <CardGrid
            items={landingUseCases.map((item, index) => ({
              ...item,
              icon: useCaseIcons[index] ?? MoreHorizontal,
            }))}
            className="min-h-0 bg-transparent sm:grid-cols-2"
            cardClassName="h-full border-2 border-neutral-100 bg-black shadow-[6px_6px_0_0_#1d4ed8]"
          />
          <CalloutPanel
            className="min-h-0"
            icon={ShieldCheck}
            title={landingTrustPanelContent.title}
            body={landingTrustPanelContent.body}
            actions={
              <Button
                variant="primary"
                size="cta"
                className="w-full justify-center lg:w-72"
                render={<Link href={landingTrustPanelContent.action} />}
              >
                {landingTrustPanelContent.label}
                <ArrowRight className="size-5" />
              </Button>
            }
          />
        </section>
      </main>
    </PublicShell>
  )
}
