// content/legal.ts

import { Handshake } from "lucide-react"

import type { ContentSectionListItem } from "@/components/shared/content-section-list"

export const termsCalloutContent = {
  title: "Back your next appointment with commitment.",
  body: "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
  icon: Handshake,
} as const

export const privacyCalloutContent = {
  title: "Back your next appointment with commitment.",
  body: "Create a Vouch, share the link, and let the confirmation rule handle the payment outcome.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
  icon: Handshake,
} as const

export const termsSections = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "By accessing or using Vouch, you agree to be bound by these Terms. If you do not agree, do not use the Service.",
    ],
  },
  {
    heading: "2. What Vouch Is",
    body: [
      "Vouch is a payment coordination platform that enables users to conditionally release funds based on mutual confirmation of an in-person meeting.",
      "Vouch does not arrange meetings, facilitate services, act as a broker, agent, intermediary, marketplace, escrow provider, or dispute-resolution platform.",
    ],
  },
  {
    heading: "3. Eligibility",
    body: [
      "You must be at least 18 years old, provide accurate identity information, and complete identity verification if required.",
    ],
  },
  {
    heading: "4. Payments and Conditional Logic",
    body: [
      "Payments are processed through third-party providers such as Stripe. Vouch does not take direct custody of funds.",
      "Funds are released only when both parties confirm presence through system-defined methods. Funds are returned when conditions are not met within the defined time window.",
      "All outcomes are automated, final within Vouch, and not subject to dispute or reversal through Vouch.",
    ],
  },
  {
    heading: "5. No Dispute Resolution",
    body: [
      "Vouch does not mediate disputes, investigate claims, reverse completed outcomes, award funds, or decide who was right.",
    ],
  },
  {
    heading: "6. Prohibited Use",
    body: [
      "You may not use Vouch for illegal activity, to circumvent financial regulations, to misrepresent identity, or to exploit or defraud other users.",
    ],
  },
  {
    heading: "7. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Vouch is not liable for user conduct, missed meetings, financial loss outside platform logic, personal injury, or damages.",
    ],
  },
] satisfies readonly ContentSectionListItem[]

export const privacySections = [
  {
    heading: "1. Introduction",
    body: [
      "Vouch respects your privacy. This Privacy Policy explains what data we collect, how we use it, and your options when using the Service.",
    ],
  },
  {
    heading: "2. Information We Collect",
    body: [
      "You may provide name, email address, phone number, identity verification information, and payment account details through third-party providers.",
      "We collect transaction amounts, transaction status, timestamps, provider references, readiness flags, and audit-safe metadata.",
    ],
  },
  {
    heading: "3. Identity and Payment Providers",
    body: [
      "Identity verification and payment processing may be handled by third-party providers such as Stripe. Vouch does not store raw card data, raw bank data, or raw identity documents.",
    ],
  },
  {
    heading: "4. How We Use Information",
    body: [
      "We use data to operate the platform, verify identity, process payments, enable confirmation flows, prevent fraud and abuse, and comply with legal obligations.",
    ],
  },
  {
    heading: "5. Sharing",
    body: [
      "We share data only when necessary with payment providers, identity providers, legal authorities when required, and fraud or abuse prevention services. We do not sell personal data.",
    ],
  },
  {
    heading: "6. Retention and Security",
    body: [
      "We keep data as long as your account is active or as required for legal, tax, and compliance purposes. We use reasonable safeguards, but no system is completely secure.",
    ],
  },
  {
    heading: "7. Your Rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data.",
    ],
  },
] satisfies readonly ContentSectionListItem[]
