import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  Lock,
  MoreHorizontal,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { PublicShell } from "@/components/navigation/public-shell"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { CardGrid } from "@/components/shared/card-grid"
import { MetricGrid } from "@/components/shared/metric-grid"
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

const processIcons: Record<string, LucideIcon> = {
  file: FileText,
  users: UsersRound,
  check: Check,
  lock: Lock,
}

const useCaseIcons: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  users: UsersRound,
  wrench: Wrench,
  more: MoreHorizontal,
}

export default function HomePage() {
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
                  <Button variant="default" size="default" className="min-w-62.5" asChild>
                    <Link href="/sign-up?return_to=/vouches/new">
                      <span className="translate-y-px">
                        {landingHeroActionsContent.primaryLabel}
                      </span>
                      <ArrowRight className="size-6" strokeWidth={1.8} />
                    </Link>
                  </Button>

                  <Button variant="secondary" size="default" className="min-w-55" asChild>
                    <Link href="#callout">
                      <span className="translate-y-px">
                        {landingHeroActionsContent.secondaryLabel}
                      </span>
                      <ArrowDown className="size-5" strokeWidth={1.8} />
                    </Link>
                  </Button>
                </>
              }
            />
          </header>

          <div id="process" className="mx-auto w-full max-w-130 min-w-0 scroll-mt-28 lg:pt-6">
            <ProcessPanel
              title={landingProcessPanelContent.title}
              steps={landingProcessSteps.map((step) => ({
                ...step,
                icon: processIcons[step.icon] ?? FileText,
              }))}
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

          <CardGrid
            items={landingUseCases.map((item) => ({
              title: item.title,
              body: item.body,
              icon: useCaseIcons[item.icon] ?? MoreHorizontal,
            }))}
            className="mt-9"
          />

          <CalloutPanel
            id="callout"
            className="mt-10"
            icon={ShieldCheck}
            title={landingTrustPanelContent.title}
            body={landingTrustPanelContent.body}
            actions={
              <Button variant="default" size="default" className="min-w-72" asChild>
                <Link href={landingTrustPanelContent.action}>
                  <span className="translate-y-px">{landingTrustPanelContent.label}</span>
                  <ArrowRight className="size-5 sm:size-6" strokeWidth={1.9} />
                </Link>
              </Button>
            }
          />
        </section>
      </section>
    </PublicShell>
  )
}
