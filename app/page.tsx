import {
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

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FeatureGridWithIcons } from "@/components/blocks/feature-grid"
import { HeroCentered } from "@/components/blocks/hero-section"
import { ProcessPanel } from "@/components/blocks/process-panel"
import { StatsCards } from "@/components/blocks/stats-section"
import { PublicShell } from "@/components/navigation/public-shell"
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

const processIcons = {
  file: FileText,
  users: UsersRound,
  check: Check,
  lock: Lock,
} satisfies Record<(typeof landingProcessSteps)[number]["icon"], LucideIcon>

const useCaseIcons = {
  calendar: CalendarDays,
  users: UsersRound,
  wrench: Wrench,
  more: MoreHorizontal,
} satisfies Record<(typeof landingUseCases)[number]["icon"], LucideIcon>

export default function HomePage() {
  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.7fr)] lg:items-center">
          <HeroCentered
            badge="Vouch"
            title={landingHeroContent.title}
            description={landingHeroContent.body}
            primaryAction={{
              label: landingHeroActionsContent.primaryLabel,
              href: "/sign-up?return_to=/vouches/new",
            }}
            secondaryAction={{ label: landingHeroActionsContent.secondaryLabel, href: "#process" }}
          />

          <div id="process" className="mx-auto w-full min-w-0 scroll-mt-28">
            <ProcessPanel
              title={landingProcessPanelContent.title}
              steps={landingProcessSteps.map((step) => ({
                ...step,
                icon: processIcons[step.icon],
              }))}
              footer={landingProcessPanelContent.footer}
            />
          </div>
        </section>

        <StatsCards
          title="Protocol metrics"
          subtitle="Payment coordination"
          stats={landingMetrics.map((item) => ({
            label: item.label,
            value: item.value,
            description: item.body,
          }))}
        />

        <FeatureGridWithIcons
          subtitle={landingSectionIntroContent.eyebrow}
          title={landingSectionIntroContent.title}
          description={landingSectionIntroContent.body}
          columns={4}
          features={landingUseCases.map((item) => {
            const Icon = useCaseIcons[item.icon]

            return {
              title: item.title,
              description: item.body,
              icon: <Icon className="h-7 w-7 text-white" />,
            }
          })}
        />

        <div id="callout" className="scroll-mt-28">
          <CTAWithBackground
            icon={<ShieldCheck className="mx-auto h-12 w-12 text-white" />}
            title={landingTrustPanelContent.title}
            description={landingTrustPanelContent.body}
            primaryAction={{
              label: landingTrustPanelContent.label,
              href: landingTrustPanelContent.action,
            }}
            backgroundColor="accent"
          />
        </div>
      </main>
    </PublicShell>
  )
}
