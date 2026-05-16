export const landingHeroContent = {
  title: "Commitment-backed payments for real-world agreements.",
  body: "Create explicit terms. Verify commitment. Release funds only when both parties confirm. Otherwise, payment never settles.",
} as const

export const landingHeroActionsContent = {
  primaryLabel: "Get started",
  secondaryLabel: "Learn more",
} as const

export const landingSectionIntroContent = {
  eyebrow: "Built for real life",
  title: "Protect the moments that matter.",
  body: "Appointments, meetups, services, consultations, and more. Vouch keeps commitments real.",
} as const

export const landingProcessSteps = [
  { number: "1", title: "Create", body: "You create a Vouch and set the terms.", icon: "file" },
  { number: "2", title: "Accept", body: "The other party accepts the Vouch.", icon: "users" },
  { number: "3", title: "Confirm", body: "Both confirm presence within the window.", icon: "check" },
  { number: "4", title: "Release", body: "Funds release. Everyone is covered.", icon: "lock" },
] as const

export const landingProcessPanelContent = {
  title: "The Vouch Process",
  footer: "No Confirmation = Refund/Void",
} as const

export const landingMetrics = [
  { label: "Dual confirmation", value: "100%", body: "Funds release only when both parties confirm." },
  { label: "No-show protection", value: "24/7", body: "If it falls through, you're covered." },
  { label: "Deterministic outcome", value: "4 steps", body: "Created, paid, confirmed, then released or refunded by state." },
  { label: "Not custody", value: "0%", body: "Vouch coordinates workflow state. Providers handle money rails." },
] as const

export const landingUseCases = [
  { icon: "calendar", title: "Appointments", body: "Protect medical, wellness, legal, financial, and other important appointments." },
  { icon: "users", title: "Meetups", body: "Feel confident meeting someone in person for the first time." },
  { icon: "wrench", title: "Services", body: "Secure payment for one-time services and specialized work." },
  { icon: "more", title: "And more", body: "Any in-person agreement where commitment matters." },
] as const

export const landingTrustPanelContent = {
  action: "/sign-up?return_to=/vouches/new",
  label: "Create a Vouch",
  title: "Mutual confirmation unlocks settlement. No confirmation, no release.",
  body: "We don’t pry. We don’t meddle. We don’t overcomplicate trust. Vouch is a deterministic commitment layer for payment coordination, aligning intent, accountability, and outcome by design. Quietly private. Mutually explicit. Economically meaningful. Anyone can copy code. Copying trust infrastructure is harder.",
} as const
