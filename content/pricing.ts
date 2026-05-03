// content/pricing.ts

import {
    BadgeDollarSign,
    CheckCircle2,
    CreditCard,
    Landmark,
} from "lucide-react"

import type { MetricGridItem } from "@/components/shared/metric-grid"
import type { ProcessStep } from "@/components/shared/process-panel"

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
        body: "Processing is handled through provider infrastructure.",
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
        eyebrow: "Provider-backed",
        title: "Payment coordination, not custody.",
        body: "Vouch coordinates the outcome through provider-backed payment infrastructure. Vouch stores participant-safe references, statuses, and lifecycle events — not raw card data, raw identity documents, or direct-custody balances.",
    },
    {
        eyebrow: "Deterministic outcome",
        title: "The rule stays simple.",
        body: "Payment does not release because someone argues better. Payment releases only when both parties confirm presence inside the window. If confirmation does not complete, funds do not release.",
    },
] as const
