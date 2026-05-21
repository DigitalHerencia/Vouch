import {
  FeatureBentoGrid,
  FeatureGridAlternating,
  FeatureGridWithIcons,
  FeatureGridWithImages,
} from "@/components/blocks/feature-grid"
import { BadgeCheck, Clock, CreditCard, Shield } from "lucide-react"

const iconFeatures = [
  { icon: <BadgeCheck className="h-7 w-7" />, title: "Confirm", description: "Both parties confirm presence in time." },
  { icon: <CreditCard className="h-7 w-7" />, title: "Capture", description: "Funds release only when payment state allows capture." },
  { icon: <Clock className="h-7 w-7" />, title: "Window", description: "Deadlines are explicit and deterministic." },
  { icon: <Shield className="h-7 w-7" />, title: "Boundary", description: "No disputes, evidence, appeals, or manual awards." },
]

const imageFeatures = [
  { image: "/logo-light.png", title: "Create", description: "Set amount and confirmation window." },
  { image: "/logo-dark.png", title: "Accept", description: "Payee accepts after payout readiness." },
  { image: "/logo-light.png", title: "Resolve", description: "Outcome follows system state." },
]

const alternatingFeatures = [
  {
    image: "/logo-light.png",
    title: "Create",
    description: "Set amount and confirmation window.",
    icon: <BadgeCheck className="h-7 w-7" />,
  },
  {
    image: "/logo-dark.png",
    title: "Accept",
    description: "Payee accepts after payout readiness.",
    icon: <CreditCard className="h-7 w-7" />,
  },
  {
    image: "/logo-light.png",
    title: "Resolve",
    description: "Outcome follows system state.",
    icon: <Clock className="h-7 w-7" />,
  },
]

const bentoFeatures = [
  ...iconFeatures,
  {
    icon: <Shield className="h-7 w-7" />,
    title: "No Arbitration",
    description: "No disputes, evidence, appeals, or manual fund awards.",
    span: "wide" as const,
  },
]

export default function FeatureGrid() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-4 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <FeatureGridWithIcons title="Operational Features" subtitle="Vouch" description="Built around deterministic payment coordination." features={iconFeatures} columns={4} />
        <FeatureGridWithImages title="Agreement Flow" subtitle="How it works" features={imageFeatures} />
        <FeatureGridAlternating features={alternatingFeatures} />
        <FeatureBentoGrid title="Core Boundaries" subtitle="Narrow Product" features={bentoFeatures} />
      </section>
    </main>
  )
}
