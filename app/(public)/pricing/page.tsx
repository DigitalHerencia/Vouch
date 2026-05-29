import {
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Handshake,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
  type LucideIcon,
} from "lucide-react"

import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FeatureGridAlternating, FeatureGridWithIcons } from "@/components/blocks/feature-grid"
import { HeroMinimal, HeroWithStats } from "@/components/blocks/hero-section"
import {
  ProcessPanel,
  ProcessPanelCallout,
  ProcessPanelGrid,
  ProcessPanelRuleGrid,
} from "@/components/blocks/process-panel"
import { StatsCards } from "@/components/blocks/stats-section"
import {
  PricingHeroContent,
  pricingCalloutContent,
  pricingComparisonRules,
  pricingFeatureCards,
  pricingFlowSteps,
  pricingNotes,
  pricingStats,
  pricingTrustContent,
} from "@/content/pricing"
import { landingCalloutContent } from "@/content/marketing"

const pricingFlowIcons = {
  amount: BadgeDollarSign,
  fee: CreditCard,
  confirm: CheckCircle2,
  release: Landmark,
} satisfies Record<(typeof pricingFlowSteps)[number]["icon"], LucideIcon>

const pricingFeatureIcons = {
  fee: BadgeDollarSign,
  stripe: Landmark,
  rules: ShieldCheck,
  lock: LockKeyhole,
  timer: TimerReset,
  handshake: Handshake,
} satisfies Record<(typeof pricingFeatureCards)[number]["icon"], LucideIcon>

export default function PricingPage() {
  return (
    <main>
      <HeroWithStats
        subtitle="Trust the Process"
        title={PricingHeroContent.title}
        titleHighlight={PricingHeroContent.titleHighlight}
        description={PricingHeroContent.body}
        primaryAction={{
          label: PricingHeroContent.primaryLabel,
          href: "/sign-up?return_to=/vouches/new",
        }}
        stats={pricingStats.map((stat) => ({
          value: stat.value,
          label: stat.label,
          body: stat.body,
        }))}
        align="left"
      />

      <FeatureGridAlternating
        features={pricingNotes.map((feature) => {
          const Icon = pricingFeatureIcons[feature.icon]

          return {
            icon: <Icon className="text-white" strokeWidth={1.8} />,
            title: feature.title,
            description: feature.body,
          }
        })}
      />

      <ProcessPanelRuleGrid
        title="Payment responsibility"
        items={pricingComparisonRules}
        footer="Customer authorizes only the protected amount"
      />

      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={landingCalloutContent.title}
        description={landingCalloutContent.body}
        primaryAction={{
          label: landingCalloutContent.label,
          href: landingCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </main>
  )
}
