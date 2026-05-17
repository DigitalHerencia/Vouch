// content/pricing.ts

import { BadgeDollarSign, CheckCircle2, CreditCard, Handshake, Landmark } from "lucide-react"

export const PricingHeroContent = {
  title: "Explicit confirmation. Deterministic settlement.",
  body: "A simple way to protect appointments and in-person agreements. The merchant pays the Vouch fee at commitment through Stripe. The customer authorizes payment through Stripe. Vouch coordinates the outcome.",
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
    body: "Merchant Vouch fee is paid at committed creation through hosted Stripe checkout.",
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
] as const

export const pricingStats = [
  {
    label: "Platform fee",
    value: "5%",
    body: "Merchant fee shown before commitment and paid through Stripe at creation.",
  },
  {
    label: "Minimum fee",
    value: "$5",
    body: "Minimum platform fee for each Vouch.",
  },
  {
    label: "Provider fee",
    value: "Stripe",
    body: "Payment method, authorization, identity, and payout readiness are hosted by Stripe.",
  },
  {
    label: "Release rule",
    value: "Both",
    body: "Dual confirmation is required before release.",
  },
] as const

export const pricingCalloutContent = {
  title: "Fraud thrives in ambiguity, exceptions, and manual intervention.",
  body: "Vouch removes all three. No unilateral action forces settlement. No human discretion surface exists to exploit. A Vouch gets created, paid, sent, accepted, confirmed, then released, voided, refunded, or not captured according to provider state.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
  icon: Handshake,
} as const

export const pricingNotes = [
  {
    eyebrow: "Transparent by default",
    title: "Fees are visible before commitment.",
    body: "The merchant sees the Vouch amount, Vouch fee, provider fee, and total before committed creation. Pricing is part of the commitment, not a surprise after it.",
  },
  {
    eyebrow: "Payment coordination, not custody",
    title: "Providers handle money rails. Vouch handles workflow logic.",
    body: "Stripe handles payment infrastructure, customer payment method collection, merchant identity, payout onboarding, and hosted payment authorization. Vouch stores participant-safe references, statuses, and lifecycle events.",
  },
  {
    eyebrow: "Deterministic outcome",
    title: "Vouch doesn’t ask who’s right. Vouch asks what happened.",
    body: "No stories. No screenshots. No appeals. No mediation. No subjective judgment. Vouch converts mutual intent into explicit protocol, bounded rules, and economically meaningful confirmation. If conditions are met, funds move. If conditions fail, they don’t.",
  },
] as const
