import {
  BadgeDollarSign,
  CalendarClock,
  Check,
  Clock3,
  FileText,
  Handshake,
  Lock,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FeatureBentoGrid } from "@/components/blocks/feature-grid"
import { StatsCards, StatsSplit } from "@/components/blocks/stats-section"
import { PublicShell } from "@/components/navigation/public-shell"
import {
  landingAudienceFeatures,
  landingCalloutContent,
  landingFeatureCards,
  landingHeroActionsContent,
  landingHeroContent,
  landingMetrics,
  landingProcessPanelContent,
  landingProcessSteps,
  landingProofStats,
} from "@/content/marketing"
import { HeroSplitPanel } from "@/components/blocks/hero-section"

const processIcons = {
  file: FileText,
  users: UsersRound,
  check: Check,
  lock: Lock,
} satisfies Record<(typeof landingProcessSteps)[number]["icon"], LucideIcon>

const ruleIcons = {
  confirmation: Check,
  window: Clock3,
  rules: ShieldCheck,
  payment: BadgeDollarSign,
  immutable: Lock,
} satisfies Record<(typeof landingFeatureCards)[number]["icon"], LucideIcon>

const audienceIcon = {
  money: BadgeDollarSign,
  calendar: CalendarClock,
  handshake: Handshake,
  rules: Lock,
} satisfies Record<(typeof landingAudienceFeatures)[number]["icon"], LucideIcon>

export default function HomePage() {
  return (
    <PublicShell>
      <HeroSplitPanel
        eyebrow={landingHeroContent.eyebrow}
        title={landingHeroContent.title}
        titleHighlight={landingHeroContent.titleHighlight}
        description={landingHeroContent.body}
        primaryAction={{
          label: landingHeroActionsContent.primaryLabel,
          href: "/sign-up?return_to=/vouches/new",
        }}
        secondaryAction={{
          label: landingHeroActionsContent.secondaryLabel,
          href: "#how-it-works",
        }}
        panelId="how-it-works"
        panelTitle={landingProcessPanelContent.title}
        panelSteps={landingProcessSteps.map((step) => ({
          ...step,
          icon: processIcons[step.icon],
        }))}
        panelFooter={landingProcessPanelContent.footer}
      />

      <FeatureBentoGrid
        align="left"
        subtitle="Clear Rules"
        title="Fair for Everyone"
        features={landingFeatureCards.map((feature) => {
          const Icon = ruleIcons[feature.icon]

          return {
            title: feature.title,
            description: feature.body,
            span: feature.span,
            icon: <Icon className="size-7 text-white" strokeWidth={1.8} />,
          }
        })}
      />

      <StatsSplit
        subtitle="Built for Real Commitment"
        title="No-shows cost everyone."
        description="A missed appointment wastes money, preparation, travel, and opportunity. Vouch puts something behind the promise before either side gives up time."
        stats={landingProofStats.map((stat) => ({
          value: stat.value,
          label: stat.label,
        }))}
      />

      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={landingCalloutContent.title}
        description={landingCalloutContent.body}
        primaryAction={{
          label: landingCalloutContent.label,
          href: landingCalloutContent.action,
        }}
        backgroundColor="accent"
      />
    </PublicShell>
  )
}
