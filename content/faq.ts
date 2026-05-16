// content/faq.ts

import { Handshake } from "lucide-react"

import type { ContentSectionListItem } from "@/components/shared/content-section-list"

export const faqCalloutContent = {
  title: "Back your next appointment with commitment.",
  body: "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
  icon: Handshake,
} as const

export const faqSections = [
  {
    heading: "1. What is Vouch?",
    body: [
      "Vouch is a commitment-backed payment tool for appointments and in-person agreements. Funds release only when both parties confirm presence during the defined window.",
    ],
  },
  {
    heading: "2. Is Vouch a marketplace?",
    body: [
      "No. Vouch does not help users find each other, list services, message, review, rank, or book providers.",
    ],
  },
  {
    heading: "3. Does Vouch hold money?",
    body: [
      "No. Vouch uses payment-provider infrastructure to coordinate payment outcomes. Vouch does not directly custody funds.",
    ],
  },
  {
    heading: "4. What happens if only one person confirms?",
    body: ["Funds do not release. Both parties must confirm within the window."],
  },
  {
    heading: "5. What happens if nobody confirms?",
    body: ["The Vouch expires and the payment is refunded, voided, or not captured."],
  },
  {
    heading: "6. Does Vouch decide disputes?",
    body: [
      "No. Vouch outcomes are deterministic. The system does not judge who was right or wrong.",
    ],
  },
  {
    heading: "7. Does Vouch guarantee someone will show up?",
    body: [
      "No. Vouch does not guarantee behavior. It creates a financial commitment and deterministic payment outcome.",
    ],
  },
] satisfies readonly ContentSectionListItem[]
