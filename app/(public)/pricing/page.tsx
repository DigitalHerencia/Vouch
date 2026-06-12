import {
  BadgeDollarSign,
  Handshake,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
  type LucideIcon,
} from "lucide-react"

import { FeatureGridAlternating } from "@/components/public/feature-grid-alternating"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { HeroWithStats } from "@/components/shared/hero-with-stats"
import { ProcessPanelRuleGrid } from "@/components/shared/process-panel-rule-grid"
import {
  PricingHeroContent,
  pricingComparisonRules,
  pricingFeatureCards,
  pricingCalloutContent,
  pricingNotes,
  pricingPageContent,
  pricingStats,
} from "@/content/pricing"

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
    <div className="grid gap-[calc(var(--vouch-section-gap)*1.75)]">
      <HeroWithStats
        subtitle={PricingHeroContent.eyebrow}
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
        title={pricingPageContent.responsibilityTitle}
        items={pricingComparisonRules}
        footer={pricingPageContent.responsibilityFooter}
      />

      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={pricingCalloutContent.title}
        description={pricingCalloutContent.body}
        primaryAction={{
          label: pricingCalloutContent.label,
          href: pricingCalloutContent.action,
        }}
        backgroundColor="primary"
      />
    </div>
  )
}
