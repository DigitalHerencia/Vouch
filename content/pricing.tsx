// content/pricing.ts

import { BadgeDollarSign, CheckCircle2, CreditCard, Landmark } from "lucide-react"

import type { MetricGridItem } from "@/components/shared/metric-grid"
import type { ProcessStep } from "@/components/shared/process-panel"

export const PricingHeroContent = {
  title: (
    <>
      Explicit
      <br />
      Confirmation.
      <br />
      Deterministic
      <br />
      Settlement.
    </>
  ),
  body: "A simple way to protect appointments and in-person agreements. Both parties confirm. Then funds release. Otherwise, you’re covered.",
} as const

export const pricingFlowSteps = [
  {
    number: "1",
    title: "Amount",
    body: "Set the Vouch amount before anyone commits.",
    icon: BadgeDollarSign,
  },
  {
    number: "2",
    title: "Fees",
    body: "Show platform and provider fees up front.",
    icon: CreditCard,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both parties confirm presence in the window.",
    icon: CheckCircle2,
  },
  {
    number: "4",
    title: "Release",
    body: "Provider infrastructure settles the outcome.",
    icon: Landmark,
  },
] satisfies ProcessStep[]

export const pricingStats = [
  {
    label: "Platform fee",
    value: "5%",
    body: "Vouch coordination fee shown before commitment.",
  },
  {
    label: "Minimum fee",
    value: "$5",
    body: "Minimum platform fee for each Vouch.",
  },
  {
    label: "Provider fee",
    value: "Stripe",
    body: "Processing is handled through provider-backed infrastructure.",
  },
  {
    label: "Release rule",
    value: "Both",
    body: "Dual confirmation is required before release.",
  },
] satisfies MetricGridItem[]

export const pricingNotes = [
  {
    eyebrow: "Transparent by default",
    title: "Fees are visible before commitment.",
    body: "The payer sees the Vouch amount, platform fee, provider fee, and total before moving forward. Pricing is part of the commitment, not a surprise after it.",
  },
  {
    eyebrow: "Payment coordination, not custody",
    title: "Providers handle money rails. Vouch handles workflow logic.",
    body: "Vouch coordinates state. Payment providers handle payment infrastructure. Identity providers handle identity. Vouch stores participant-safe references, statuses, and lifecycle events — not raw card data, raw identity documents, or direct-custody balances.",
  },
  {
    eyebrow: "Deterministic outcome",
    title: "Vouch doesn’t ask who’s right. Vouch asks what happened.",
    body: "No stories. No screenshots. No appeals. No mediation. No subjective judgment. Vouch converts mutual intent into explicit protocol, bounded rules, and economically meaningful confirmation. If conditions are met, funds move. If conditions fail, they don’t.",
  },
  {
    eyebrow: "Automated finality",
    title: "Fraud thrives in ambiguity, exceptions, and manual intervention.",
    body: "Vouch removes all three. No unilateral action forces settlement. No human discretion surface exists to exploit. A Vouch gets created, paid, sent, accepted, confirmed, then released or refunded according to system state.",
  },
] as const
