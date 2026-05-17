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

export const disclaimerCalloutContent = {
  title: "Create only when the commitment is explicit.",
  body: "A Vouch follows provider-backed payment state and the confirmation window. It does not arbitrate, investigate, or rewrite outcomes.",
  label: "Create a Vouch",
  action: "/sign-up?return_to=/vouches/new",
  icon: Handshake,
} as const

export const userAgreementCalloutContent = {
  title: "Use Vouch as a narrow payment coordination system.",
  body: "The product is intentionally bounded: no marketplace, no scheduling, no messaging, no dispute workflow, and no manual fund award.",
  label: "Create account",
  action: "/sign-up",
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

export const disclaimerSections = [
  {
    heading: "1. No Escrow or Custody",
    body: [
      "Vouch coordinates payment state through third-party providers. Vouch does not directly custody funds, hold card data, store bank data, or act as an escrow provider.",
    ],
  },
  {
    heading: "2. Deterministic Confirmation Rule",
    body: [
      "Funds release only when both parties confirm presence within the confirmation window and the provider payment state permits settlement.",
      "One-sided confirmation, late confirmation, expired windows, provider failures, or incomplete readiness do not release funds through Vouch.",
    ],
  },
  {
    heading: "3. No Dispute or Appeal Process",
    body: [
      "Vouch does not collect evidence, judge claims, decide who was right, mediate disputes, or provide an appeal surface.",
      "Outcomes follow authenticated participant state, provider-backed payment state, and the configured confirmation window.",
    ],
  },
  {
    heading: "4. User Responsibility",
    body: [
      "Users are responsible for creating accurate commitments, reviewing amounts and timing before submission, and understanding that sent Vouches are intended to be immutable.",
    ],
  },
] satisfies readonly ContentSectionListItem[]

export const userAgreementSections = [
  {
    heading: "1. Account Commitments",
    body: [
      "You agree to provide accurate account information, maintain account security, and use Vouch only for lawful real-world commitments.",
    ],
  },
  {
    heading: "2. Payment Provider Flows",
    body: [
      "You understand that customer authorization, merchant fee checkout, identity verification, payout readiness, and related payment flows may be hosted by Stripe or another provider.",
    ],
  },
  {
    heading: "3. Confirmation Behavior",
    body: [
      "You agree not to misuse confirmation codes, misrepresent presence, attempt to force settlement, or interfere with another participant's confirmation flow.",
    ],
  },
  {
    heading: "4. Product Boundaries",
    body: [
      "You understand Vouch is not a marketplace, broker, scheduler, messaging service, review system, dispute system, escrow provider, public directory, or discovery platform.",
    ],
  },
] satisfies readonly ContentSectionListItem[]
