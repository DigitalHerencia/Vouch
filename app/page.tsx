import {
  CalendarDays,
  MoreHorizontal,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react"
import { CTASection } from "@/components/blocks/cta-section"
import { FeatureGrid } from "@/components/blocks/feature-grid"
import { HeroSection } from "@/components/blocks/hero-section"
import { OnboardingFlow } from "@/components/blocks/onboarding-flow"
import { StatsSection } from "@/components/blocks/stats-section"
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
import { PublicShell } from "@/components/navigation/public-shell"

const useCaseIcons = [CalendarDays, UsersRound, Wrench, MoreHorizontal] as const

export default function LandingPage() {
  return (
    <PublicShell>
      <main className="space-y-8 md:space-y-12">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
          <HeroSection.Split
            title={landingHeroContent.title}
            description={landingHeroContent.body}
            primaryAction={{
              label: landingHeroActionsContent.primaryLabel,
              href: "/sign-up?return_to=/vouches/new",
            }}
            secondaryAction={{
              label: landingHeroActionsContent.secondaryLabel,
              href: "#process",
            }}
            media={
              <OnboardingFlow.Completion
                title={landingProcessPanelContent.title}
                subtitle={landingProcessPanelContent.footer}
                features={landingProcessSteps.map((step) => ({
                  title: `${step.number}. ${step.title}`,
                  description: step.body,
                }))}
                className="max-w-none border-0 shadow-none"
              />
            }
            className="px-0 py-0"
          />
        </section>

        <section id="process" className="mb-8 space-y-8 md:space-y-12">
          <StatsSection.Cards
            stats={landingMetrics.map((item) => ({
              label: item.label,
              value: item.value,
              description: item.body,
            }))}
            className="bg-transparent px-0 py-0"
          />
          <HeroSection.Minimal
            title={landingSectionIntroContent.title}
            description={landingSectionIntroContent.body}
            className="px-0 py-8"
          />

          <FeatureGrid.WithIcons
            subtitle={landingSectionIntroContent.eyebrow}
            features={landingUseCases.map((item, index) => {
              const Icon = useCaseIcons[index] ?? MoreHorizontal
              return {
                title: item.title,
                description: item.body,
                icon: <Icon className="size-7" />,
              }
            })}
            columns={4}
            className="px-0 py-0"
          />
          <CTASection.WithBackground
            className="px-0 py-0"
            icon={<ShieldCheck className="size-8" />}
            title={landingTrustPanelContent.title}
            description={landingTrustPanelContent.body}
            primaryAction={{
              label: landingTrustPanelContent.label,
              href: landingTrustPanelContent.action,
            }}
          />
        </section>
      </main>
    </PublicShell>
  )
}
