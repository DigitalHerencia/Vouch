import { CTAWithBackground } from "@/components/blocks/cta-section"
import { FeatureGridAlternating } from "@/components/blocks/feature-grid"
import { HeroMinimal, HeroWithStats } from "@/components/blocks/hero-section"
import { StatsCards } from "@/components/blocks/stats-section"
import {
  pricingAlternatingFeatures,
  pricingCalloutContent,
  pricingStats,
  PricingHeroContent,
} from "@/content/pricing"

export default function PricingPage() {
  const PricingCalloutIcon = pricingCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroWithStats
        title={PricingHeroContent.title}
        description={PricingHeroContent.body}
        primaryAction={{ label: "Create a Vouch", href: "/sign-up?return_to=/vouches/new" }}
        stats={pricingStats.map((stat) => ({ value: stat.value, label: stat.label }))}
      />

      <FeatureGridAlternating
        features={pricingAlternatingFeatures.map((feature, index) => {
          const Icon = feature.icon
          return {
            icon: <Icon className="size-8" />,
            title: feature.title,
            description: feature.description,
            image: index % 2 === 0 ? "/logo-light.png" : "/logo-dark.png",
          }
        })}
      />

      <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_24rem]">
        <HeroMinimal
          title={PricingHeroContent.title}
          description="Fees are visible before commitment. Provider-backed payment state determines what can happen next."
          primaryAction={{ label: "Create a Vouch", href: "/sign-up?return_to=/vouches/new" }}
        />
        <StatsCards
          stats={pricingStats.map((stat) => ({
            label: stat.label,
            value: stat.value,
            description: stat.body,
          }))}
        />
      </section>

      <CTAWithBackground
        icon={<PricingCalloutIcon className="size-8" />}
        title={pricingCalloutContent.title}
        description={pricingCalloutContent.body}
        primaryAction={{ label: pricingCalloutContent.label, href: pricingCalloutContent.action }}
      />
    </main>
  )
}
