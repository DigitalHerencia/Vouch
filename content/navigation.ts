export const publicNavigationContent = {
  brand: "Vouch",
  links: {
    home: "Home",
    pricing: "Pricing",
    faq: "FAQ",
    terms: "Terms",
    privacy: "Privacy",
    signIn: "Sign in",
    getStarted: "Get started",
  },
  labels: {
    home: "Vouch home",
    mobile: "Public mobile navigation",
    mobileDefault: "Mobile navigation",
    secureStripeStep: "Secure Stripe step",
    continueToStripe: "Continue to Stripe",
  },
} as const

export const tenantNavigationContent = {
  links: {
    dashboard: "Dashboard",
    vouches: "Vouches",
    connect: "Connect",
    newVouch: "New Vouch",
    stripe: "Stripe",
    account: "Account",
  },
  labels: {
    dashboard: "Vouch dashboard",
    mainNavigation: "Main navigation",
    footerNavigation: "Tenant footer navigation",
    notifications: "Notifications",
    mobileNavigation: "Tenant mobile navigation",
  },
  footer: {
    legalLine: "Vouch. Payment coordination, not escrow.",
  },
} as const
