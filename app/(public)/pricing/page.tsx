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
import { landingCalloutContent } from "@/content/marketing"
import {
  PricingHeroContent,
  pricingComparisonRules,
  pricingFeatureCards,
  pricingNotes,
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
    <div className="grid gap-14 md:gap-18 lg:gap-24">
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
    </div>
  )
}
