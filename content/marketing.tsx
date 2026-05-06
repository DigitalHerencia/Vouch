// content/marketing.ts

import {
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  LockKeyhole,
  MoreHorizontal,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react"

import type { CardGridItem } from "@/components/shared/card-grid"
import type { MetricGridItem } from "@/components/shared/metric-grid"
import type { ProcessStep } from "@/components/shared/process-panel"

export const landingHeroContent = {
  title: (
    <>
      Commitment-
      <br />
      backed payments
      <br />
      for real-world
      <br />
      agreements.
    </>
  ),
  body: "Create explicit terms. Verify commitment. Release funds only when both parties confirm. Otherwise, payment never settles.",
} as const

export const landingProcessSteps = [
  {
    number: "1",
    title: "Create",
    body: "You create a Vouch and set the terms.",
    icon: FilePenLine,
  },
  {
    number: "2",
    title: "Accept",
    body: "The other party accepts the Vouch.",
    icon: UsersRound,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both confirm presence within the window.",
    icon: CheckCircle2,
  },
  {
    number: "4",
    title: "Release",
    body: "Funds release. Everyone is covered.",
    icon: LockKeyhole,
  },
] satisfies ProcessStep[]

export const landingMetrics = [
  {
    label: "Dual confirmation",
    value: "100%",
    body: "Funds release only when both parties confirm.",
  },
  {
    label: "No-show protection",
    value: "24/7",
    body: "If it falls through, you’re covered.",
  },
  {
    label: "Deterministic outcome",
    value: "4 steps",
    body: "Created, paid, confirmed, then released or refunded by state.",
  },
  {
    label: "Not custody",
    value: "0%",
    body: "Vouch coordinates workflow state. Providers handle money rails.",
  },
] satisfies MetricGridItem[]

export const landingUseCases = [
  {
    icon: CalendarDays,
    title: "Appointments",
    body: "Protect medical, wellness, legal, financial, and other important appointments.",
  },
  {
    icon: UsersRound,
    title: "Meetups",
    body: "Feel confident meeting someone in person for the first time.",
  },
  {
    icon: Wrench,
    title: "Services",
    body: "Secure payment for one-time services and specialized work.",
  },
  {
    icon: MoreHorizontal,
    title: "And more",
    body: "Any in-person agreement where commitment matters.",
  },
] satisfies CardGridItem[]

export const landingTrustPanelContent = {
  icon: ShieldCheck,
  title: "Mutual confirmation unlocks settlement. No confirmation, no release.",
  body: "We don’t pry. We don’t meddle. We don’t overcomplicate trust. Vouch is a deterministic commitment layer for payment coordination, aligning intent, accountability, and outcome by design. Quietly private. Mutually explicit. Economically meaningful. Anyone can copy code. Copying trust infrastructure is harder.",
} as const
