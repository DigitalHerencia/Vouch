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
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroWithStats
        title={PricingHeroContent.title}
        titleHighlight={PricingHeroContent.titleHighlight}
        description={PricingHeroContent.body}
        primaryAction={{
          label: PricingHeroContent.primaryLabel,
          href: "/sign-up?return_to=/vouches/new",
        }}
        stats={pricingStats.map((stat) => ({ value: stat.value, label: stat.label }))}
      />

      <section className="grid gap-8 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-16">
        <ProcessPanel
          title="How pricing works"
          steps={pricingFlowSteps.map((step) => ({
            ...step,
            icon: pricingFlowIcons[step.icon],
          }))}
          footer="Merchant fee is paid before commitment"
        />

        <StatsCards
          stats={pricingStats.map((stat) => ({
            label: stat.label,
            value: stat.value,
            description: stat.body,
          }))}
        />
      </section>

      <FeatureGridWithIcons
        subtitle="Production pricing"
        title="Transparent before commitment"
        description="Vouch separates the merchant-paid protocol issuance fee from the customer protected authorization."
        columns={3}
        features={pricingFeatureCards.map((feature) => {
          const Icon = pricingFeatureIcons[feature.icon]

          return {
            title: feature.title,
            description: feature.body,
            icon: <Icon className="size-7 text-white" strokeWidth={1.8} />,
          }
        })}
      />

      <FeatureGridAlternating
        features={pricingNotes.map((feature, index) => {
          const Icon = pricingFeatureIcons[feature.icon]

          return {
            icon: <Icon className="size-8 text-white" strokeWidth={1.8} />,
            title: feature.title,
            description: feature.body,
            image: index % 2 === 0 ? "/logo-light.png" : "/logo-dark.png",
          }
        })}
      />

      <section className="px-4 md:px-8 lg:px-16">
        <ProcessPanelRuleGrid
          title="Payment responsibility"
          items={pricingComparisonRules}
          footer="Customer authorizes only the protected amount"
        />
      </section>

      <section className="grid gap-8 px-4 md:px-8 lg:grid-cols-[24rem_minmax(0,1fr)] lg:px-16">
        <HeroMinimal
          title="Pay for the protocol. Capture only on confirmation."
          description="The merchant buys the Vouch. The customer authorizes the protected amount. Both confirm in-window, or no capture happens."
          primaryAction={{ label: "Create a Vouch", href: "/sign-up?return_to=/vouches/new" }}
        />

        <ProcessPanelGrid
          subtitle={pricingTrustContent.subtitle}
          title={pricingTrustContent.title}
          logos={pricingTrustContent.logos.map((logo) => ({
            name: logo.name,
            detail: logo.detail,
            logo: (
              <span className="font-(family-name:--font-display) text-xl font-black tracking-wide text-black uppercase">
                {logo.logo}
              </span>
            ),
          }))}
          footer="Stripe owns payment truth. Vouch owns workflow truth."
        />
      </section>

      <ProcessPanelCallout
        icon={ShieldCheck}
        title="No hidden discretionary layer"
        body="There are no disputes, evidence uploads, manual settlement awards, support overrides, or unilateral release controls."
        action="Outcome follows system state"
      />

      <CTAWithBackground
        icon={<Handshake className="mx-auto size-12 text-white" strokeWidth={1.8} />}
        title={pricingCalloutContent.title}
        description={pricingCalloutContent.body}
        primaryAction={{ label: pricingCalloutContent.label, href: pricingCalloutContent.action }}
        backgroundColor="accent"
      />
    </main>
  )
}
