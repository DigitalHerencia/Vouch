import { CTASection } from "@/components/blocks/cta-section"
import { FeatureGrid } from "@/components/blocks/feature-grid"
import { HeroSection } from "@/components/blocks/hero-section"
import { LogoCloud } from "@/components/blocks/logo-cloud"
import { StatsSection } from "@/components/blocks/stats-section"
import {
  pricingAlternatingFeatures,
  pricingCalloutContent,
  pricingStats,
  pricingTrustContent,
  PricingHeroContent,
} from "@/content/pricing"

export default function PricingPage() {
  const PricingCalloutIcon = pricingCalloutContent.icon

  return (
    <main className="grid min-h-[calc(100dvh-8rem)] gap-8 sm:gap-10 md:gap-12">
      <HeroSection.WithStats
        title={PricingHeroContent.title}
        description={PricingHeroContent.body}
        primaryAction={{ label: "Create a Vouch", href: "/sign-up?return_to=/vouches/new" }}
        stats={pricingStats.map((stat) => ({ value: stat.value, label: stat.label }))}
        className="px-0 py-0"
      />

      <LogoCloud.Cards
        title={pricingTrustContent.title}
        subtitle={pricingTrustContent.subtitle}
        logos={pricingTrustContent.logos.map((item) => ({
          name: item.name,
          logo: (
            <span className="font-(family-name:--font-display) text-2xl tracking-[0.08em] text-white uppercase">
              {item.logo}
            </span>
          ),
        }))}
        className="bg-transparent px-0 py-0"
      />

      <FeatureGrid.Alternating
        features={pricingAlternatingFeatures.map((feature, index) => {
          const Icon = feature.icon
          return {
            icon: <Icon className="size-8" />,
            title: feature.title,
            description: feature.description,
            image: index % 2 === 0 ? "/logo-light.png" : "/logo-dark.png",
          }
        })}
        className="px-0 py-0"
      />

      <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_24rem]">
        <HeroSection.Minimal
          title={PricingHeroContent.title}
          description="Fees are visible before commitment. Provider-backed payment state determines what can happen next."
          primaryAction={{ label: "Create a Vouch", href: "/sign-up?return_to=/vouches/new" }}
          className="px-0 py-0"
        />
        <StatsSection.Cards
          stats={pricingStats.map((stat) => ({
            label: stat.label,
            value: stat.value,
            description: stat.body,
          }))}
          className="bg-transparent px-0 py-0"
        />
      </section>

      <CTASection.WithBackground
        className="px-0 py-0"
        icon={<PricingCalloutIcon className="size-8" />}
        title={pricingCalloutContent.title}
        description={pricingCalloutContent.body}
        primaryAction={{ label: pricingCalloutContent.label, href: pricingCalloutContent.action }}
      />
    </main>
  )
}
