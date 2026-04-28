import "server-only"

const nav = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
] as const

export async function getPublicNavigation() {
  return {
    brand: "Vouch",
    links: nav,
    cta: { label: "Create a Vouch", href: "/sign-up" },
    signIn: { label: "Sign in", href: "/sign-in" },
  }
}

export async function getPublicFooterContent() {
  return {
    brand: "Vouch",
    tagline: "Commitment-backed payments for appointments and in-person agreements.",
    links: [
      ...nav,
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
    ],
  }
}

export async function getLandingPageContent() {
  return {
    pageId: "landing",
    headline: "Stop losing time to no-shows.",
    subheadline:
      "Vouch lets clients commit funds before an appointment and releases payment only when both parties confirm they showed up.",
    primaryCta: { id: "create_vouch", label: "Create a Vouch", href: "/sign-up" },
    secondaryCta: { id: "how_it_works", label: "See how it works", href: "/how-it-works" },
    sections: [
      {
        id: "mechanism",
        title: "Both confirm, funds release. Otherwise, refund.",
        body: "One person creates a Vouch and commits funds. The other accepts. If both confirm presence during the window, funds release. If not, funds refund, void, or remain uncaptured.",
      },
      {
        id: "neutrality",
        title: "No marketplace. No reviews. No arbitration.",
        body: "Users bring their own agreement. Vouch provides the payment coordination layer only.",
      },
    ],
  }
}

export async function getHowItWorksContent() {
  return {
    pageId: "how_it_works",
    title: "How Vouch works",
    steps: [
      { title: "Create a Vouch", body: "Enter the amount, meeting window, and recipient." },
      {
        title: "The other party accepts",
        body: "They review the terms and complete required setup.",
      },
      {
        title: "Both confirm presence",
        body: "During the window, both parties confirm they showed up.",
      },
      {
        title: "Release or refund",
        body: "Both confirm and funds release. Otherwise, funds do not release.",
      },
    ],
  }
}

export async function getPricingContent() {
  return {
    pageId: "pricing",
    title: "Simple, transparent pricing",
    body: "Vouch shows the amount, platform fee, and total before payment commitment. Final fees are shown before confirming.",
    feeModel: {
      minimumFeeLabel: "Minimum fee",
      percentageFeeLabel: "Percentage fee",
      note: "Exact MVP fee constants should come from the payment/fee module when wired.",
    },
  }
}

export async function getFaqContent() {
  return {
    pageId: "faq",
    title: "FAQ",
    items: [
      {
        question: "Is Vouch a marketplace?",
        answer:
          "No. Vouch does not provide discovery, listings, profiles, reviews, ratings, or matching.",
      },
      {
        question: "Does one confirmation release funds?",
        answer: "No. Funds release only when both parties confirm within the confirmation window.",
      },
      {
        question: "What happens if confirmation is incomplete?",
        answer: "The payment is refunded, voided, or not captured according to the provider flow.",
      },
      {
        question: "Does Vouch decide disputes?",
        answer: "No. Vouch does not judge who was right or manually award funds.",
      },
    ],
  }
}

export async function getTermsPageContent() {
  return {
    pageId: "terms",
    title: "Terms",
    sections: [
      "Vouch is payment coordination.",
      "Vouch is not a marketplace, broker, scheduler, arbitration system, or escrow provider.",
      "Payment processing is handled by payment provider infrastructure.",
      "Funds release only when both parties confirm presence within the confirmation window.",
      "Otherwise, the payment refunds, voids, or remains uncaptured according to provider flow.",
    ],
  }
}

export async function getPrivacyPageContent() {
  return {
    pageId: "privacy",
    title: "Privacy",
    sections: [
      "Vouch minimizes stored data.",
      "Vouch stores payment and verification references, not raw card data or raw identity documents.",
      "Audit and notification records are kept for operational integrity.",
    ],
  }
}
