"use client"

import {
  CTABanner,
  CTANewsletter,
  CTASimple,
  CTASplit,
  CTAWithBackground,
} from "@/components/blocks/cta-section"

export default function CTASection() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <CTASimple
          title="Coordinate the Commitment"
          description="Create a Vouch, accept the terms, and confirm presence in time."
          primaryAction={{ label: "Create Vouch", href: "#" }}
          secondaryAction={{ label: "Learn More", href: "#" }}
        />
        <CTAWithBackground
          backgroundColor="primary"
          title="Both Confirm, Funds Release"
          description="Payment outcome follows authenticated state."
          primaryAction={{ label: "Get Started", href: "#" }}
        />
        <CTANewsletter title="Stay Updated" description="Get product updates as Vouch evolves." />
        <CTASplit
          title="Provider-Backed Settlement"
          description="Manual-capture payment coordination with clear release rules."
          imageSrc="/logo-light.png"
          imageAlt="Payment coordination"
          primaryAction={{ label: "Explore", href: "#" }}
          secondaryAction={{ label: "Docs", href: "#" }}
        />
        <CTABanner
          text="New payment coordination blocks are available."
          action={{ label: "View Blocks", href: "#" }}
          dismissible
        />
      </section>
    </main>
  )
}
