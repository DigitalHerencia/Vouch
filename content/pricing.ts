export const PricingHeroContent = {
  eyebrow: "Product and pricing",
  title: "One clear fee for",
  titleHighlight: "protected appointments.",
  body: "The business pays a one-time, non-refundable protocol fee of 5% of the protected amount, with a $5 minimum. The customer separately authorizes only the protected amount directly to the business through Stripe.",
  primaryLabel: "Create business account",
} as const

export const pricingPageContent = {
  responsibilityTitle: "Built around one clear agreement",
  responsibilityFooter: "Simple for the business. Clear for the customer.",
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
    label: "Protocol fee",
    value: "5%",
    body: "Paid once by the business before the customer authorization link is issued.",
  },
  {
    label: "Minimum fee",
    value: "$5",
    body: "The exact non-refundable fee is shown before the business opens Stripe Checkout.",
  },
  {
    label: "Customer pays Vouch",
    value: "$0",
    body: "The customer authorizes the protected amount directly to the connected business.",
  },
  {
    label: "Required confirmations",
    value: "2",
    body: "Both participants must confirm inside the window before capture can proceed.",
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
    icon: "fee",
    title: "Know the price before you create",
    body: "The business reviews the protected amount and Vouch fee before paying. Once paid, the customer authorization link is ready to share.",
  },
  {
    icon: "stripe",
    title: "Keep the appointment in one place",
    body: "Amount, appointment time, authorization status, confirmation window, and next action stay together on the Vouch detail page.",
  },
  {
    icon: "rules",
    title: "Give both people the same rule",
    body: "Both people confirm during the appointment window before the protected amount can be captured. If confirmation is incomplete, it is not captured.",
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
  title: "Protect your next appointment.",
  body: "Create a Vouch, send the customer link, and keep the commitment clear from authorization through confirmation.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
} as const
