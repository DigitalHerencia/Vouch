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
      "Vouch is a commitment-backed payment tool for appointments and in-person agreements. Funds release only when both parties confirm presence during the defined window.",
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
    body: ["Funds do not release. Both parties must confirm within the window."],
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
