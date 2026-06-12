import {
  BadgeDollarSign,
  Check,
  Clock3,
  FileText,
  Handshake,
  Lock,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { createElement } from "react"

import { PublicShell } from "@/components/nav/public-shell"
import { FeatureBentoGrid } from "@/components/public/feature-bento-grid"
import { CTAWithBackground } from "@/components/shared/cta-with-background"
import { HeroSplitPanel } from "@/components/shared/hero-split-panel"
import { StatsSplit } from "@/components/shared/stats-split"
import {
  landingCalloutContent,
  landingFeatureCards,
  landingHeroActionsContent,
  landingHeroContent,
  landingPageSections,
  landingProcessPanelContent,
  landingProcessSteps,
  landingProofStats,
} from "@/content/marketing"

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

export default function HomePage() {
  return (
    <PublicShell>
      <div className="grid gap-[calc(var(--vouch-section-gap)*1.75)]">
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
          subtitle={landingPageSections.rules.eyebrow}
          title={landingPageSections.rules.title}
          features={landingFeatureCards.map((feature) => ({
            title: feature.title,
            description: feature.body,
            span: feature.span,
            icon: createElement(ruleIcons[feature.icon], {
              className: "size-7 text-white",
              strokeWidth: 1.8,
            }),
          }))}
        />

        <StatsSplit
          subtitle={landingPageSections.impact.eyebrow}
          title={landingPageSections.impact.title}
          description={landingPageSections.impact.body}
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
          backgroundColor="primary"
        />
      </div>
    </PublicShell>
  )
}
