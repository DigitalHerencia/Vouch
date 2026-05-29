export const PricingHeroContent = {
  title: "Transparent pricing for",
  titleHighlight: "protected appointments.",
  body: "The merchant pays the Vouch protocol fee before commitment. The customer authorizes only the protected amount. Payment is captured only when both participants confirm in the appointment window.",
  primaryLabel: "Create a Vouch",
} as const

export const pricingFlowSteps = [
  {
    number: "01",
    title: "Set amount",
    body: "Choose the protected amount before either side commits.",
    icon: "amount",
  },
  {
    number: "02",
    title: "Merchant pays Vouch fee",
    body: "The fee is shown up front and paid through hosted Stripe checkout.",
    icon: "fee",
  },
  {
    number: "03",
    title: "Customer authorizes",
    body: "The customer authorizes the protected amount through Stripe manual capture.",
    icon: "confirm",
  },
  {
    number: "04",
    title: "Release requires confirmation",
    body: "Both people confirm inside the window before capture can proceed.",
    icon: "release",
  },
] as const

export const pricingStats = [
  {
    label: "Set amount",
    value: "1",
    body: "Choose the protected amount before either side commits.",
  },
  {
    label: "Merchant pays Vouch fee",
    value: "2",
    body: "The fee is shown up front and paid through hosted Stripe checkout.",
  },
  {
    label: "Customer authorizes",
    value: "3",
    body: "The customer authorizes the protected amount through Stripe manual capture.",
  },
  {
    label: "Release requires confirmation",
    value: "4",
    body: "Both people confirm inside the window before capture can proceed.",
  },
] as const

export const pricingFeatureCards = [
  {
    icon: "fee",
    title: "Merchant-paid protocol fee",
    body: "The merchant pays Vouch to issue one commitment protocol instance before the Vouch becomes committed.",
  },
  {
    icon: "stripe",
    title: "Stripe-hosted authorization",
    body: "Stripe handles customer payment authorization, payment method collection, and provider-backed payment state.",
  },
  {
    icon: "rules",
    title: "No capture at checkout",
    body: "Customer authorization does not release funds. Capture waits for bilateral confirmation and provider-state retrieval.",
  },
  {
    icon: "lock",
    title: "Committed terms are fixed",
    body: "Amount, appointment time, confirmation window, and fee snapshot are frozen at commitment.",
  },
  {
    icon: "timer",
    title: "Window-bound confirmation",
    body: "Confirmation only counts during the configured appointment window.",
  },
  {
    icon: "handshake",
    title: "Fair to both participants",
    body: "The same rules apply to both sides before, during, and after the appointment.",
  },
] as const

export const pricingNotes = [
  {
    eyebrow: "Transparent by default",
    icon: "fee",
    title: "Fees are visible before commitment.",
    body: "The merchant sees the Vouch amount, Vouch fee, provider fee, and total before committed creation. Pricing is part of the commitment, not a surprise after it.",
  },
  {
    eyebrow: "Payment coordination, not custody",
    icon: "stripe",
    title: "Providers handle money rails. Vouch handles workflow logic.",
    body: "Stripe handles payment infrastructure, customer payment method collection, merchant identity, payout onboarding, and hosted payment authorization. Vouch stores participant-safe references, statuses, and lifecycle events.",
  },
  {
    eyebrow: "Deterministic outcome",
    icon: "rules",
    title: "Vouch doesn't ask who's right. Vouch asks what happened.",
    body: "No stories. No screenshots. No appeals. No mediation. No subjective judgment. If conditions are met, funds move. If conditions fail, they don't.",
  },
] as const

export const pricingComparisonRules = [
  {
    label: "Merchant pays",
    value: "Vouch issuance fee",
  },
  {
    label: "Customer authorizes",
    value: "Protected amount only",
  },
  {
    label: "Both confirm",
    value: "Capture can proceed",
  },
  {
    label: "Confirmation fails",
    value: "No capture",
  },
] as const

export const pricingTrustContent = {
  title: "Provider-backed trust, narrow by design.",
  subtitle: "Payment infrastructure",
  logos: [
    { name: "Stripe", logo: "Stripe", detail: "payment truth" },
    { name: "Stripe Connect", logo: "Connect", detail: "payout rails" },
    { name: "Manual capture", logo: "Requires Capture", detail: "held state" },
    { name: "Vouch", logo: "Vouch", detail: "workflow truth" },
  ],
} as const

export const pricingCalloutContent = {
  title: "Clear rules. Automatic outcomes.",
  body: "Merchant pays to issue the Vouch. Customer authorizes the protected amount. Both confirm in-window, or no capture happens. Stripe owns payment truth. Vouch owns workflow truth.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
} as const
