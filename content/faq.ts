// content/faq.ts

type ContentSectionListItem = {
  heading: string
  body: readonly string[]
}

export const faqCalloutContent = {
  title: "Back your next appointment with commitment.",
  body: "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
} as const

export const faqPageContent = {
  eyebrow: "Questions and answers",
  title: "How Vouch works",
  description:
    "Clear answers about fees, customer authorization, confirmation, and what happens when confirmation is incomplete.",
} as const

export const faqSections = [
  {
    heading: "What is Vouch?",
    body: [
      "Vouch is an appointment deposit authorization protocol. A customer authorizes a deposit directly to the connected business through Stripe. Capture is allowed only after both participants confirm during the defined window.",
    ],
  },
  {
    heading: "What does Vouch cost?",
    body: [
      "The business pays a separate one-time, non-refundable protocol fee equal to 5% of the protected amount, with a $5 minimum. The exact fee is shown before Stripe Checkout opens.",
    ],
  },
  {
    heading: "Does the customer pay Vouch?",
    body: [
      "No. The customer authorizes only the protected appointment amount directly to the connected business through Stripe.",
    ],
  },
  {
    heading: "Is the customer charged immediately?",
    body: [
      "No. Stripe authorizes the protected amount using manual capture. The authorization can be captured only when both participants confirm inside the confirmation window.",
    ],
  },
  {
    heading: "Does the customer need an account?",
    body: [
      "Yes. After completing Stripe authorization, the customer signs in or creates an account so the completed authorization can be securely claimed and shown on their dashboard.",
    ],
  },
  {
    heading: "When can a business create a Vouch?",
    body: [
      "A Vouch can be created only during the 24 hours immediately before a future appointment. Stripe Connect onboarding, charge capability, and payout capability must be ready first.",
    ],
  },
  {
    heading: "Is Vouch a marketplace?",
    body: [
      "No. Vouch does not help users find each other, list services, message, review, rank, or book providers.",
    ],
  },
  {
    heading: "Does Vouch hold money?",
    body: [
      "No. Vouch uses payment-provider infrastructure to coordinate payment outcomes. Vouch does not directly custody funds.",
    ],
  },
  {
    heading: "What happens if only one person confirms?",
    body: ["The deposit is not captured. Both participants must confirm within the window."],
  },
  {
    heading: "What happens if nobody confirms?",
    body: ["The Vouch expires and the payment is refunded, voided, or not captured."],
  },
  {
    heading: "Does Vouch decide disputes?",
    body: [
      "No. Vouch outcomes are deterministic. The system does not judge who was right or wrong.",
    ],
  },
  {
    heading: "Does Vouch guarantee someone will show up?",
    body: [
      "No. Vouch does not guarantee behavior. It creates a financial commitment and deterministic payment outcome.",
    ],
  },
] satisfies readonly ContentSectionListItem[]
