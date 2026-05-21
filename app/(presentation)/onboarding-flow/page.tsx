"use client"

import {
  CompletionScreen,
  GoalSelection,
  OnboardingWizard,
  ProfileSetup,
  WelcomeScreen,
  WorkspaceSetup,
} from "@/components/blocks/onboarding-flow"
import { BadgeCheck, Building, CreditCard, Shield, User } from "lucide-react"

const features = [
  { icon: <CreditCard className="h-5 w-5" />, title: "Payment Setup", description: "Prepare provider-backed payment readiness." },
  { icon: <Shield className="h-5 w-5" />, title: "Boundaries", description: "Confirm the deterministic release rule." },
  { icon: <BadgeCheck className="h-5 w-5" />, title: "Confirm", description: "Know when and how to confirm presence." },
]

const goals = [
  { id: "create", title: "Create Vouches", description: "Coordinate payer commitments.", icon: <CreditCard className="h-5 w-5" /> },
  { id: "accept", title: "Accept Vouches", description: "Prepare payout readiness.", icon: <Building className="h-5 w-5" /> },
  { id: "confirm", title: "Confirm Presence", description: "Resolve agreements in time.", icon: <BadgeCheck className="h-5 w-5" /> },
  { id: "review", title: "Review State", description: "Track provider-backed outcomes.", icon: <Shield className="h-5 w-5" /> },
]

export default function OnboardingFlow() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-6 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <OnboardingWizard
          steps={[
            { id: "profile", title: "Profile", description: "Identify the participant.", icon: <User className="h-7 w-7" />, content: <p className="text-muted-foreground">Add account details before creating a Vouch.</p> },
            { id: "payment", title: "Payment", description: "Prepare payment readiness.", icon: <CreditCard className="h-7 w-7" />, content: <p className="text-muted-foreground">Connect provider-backed payment setup.</p> },
            { id: "confirm", title: "Confirm", description: "Understand the confirmation window.", icon: <BadgeCheck className="h-7 w-7" />, content: <p className="text-muted-foreground">Both parties must confirm in time.</p> },
          ]}
        />
        <WelcomeScreen title="Welcome to Vouch" subtitle="Set up commitment-backed coordination." features={features} primaryAction={{ label: "Begin" }} secondaryAction={{ label: "Skip" }} />
        <ProfileSetup />
        <WorkspaceSetup onSkip={() => undefined} />
        <GoalSelection goals={goals} />
        <CompletionScreen
          features={[
            { title: "Account Ready", description: "Your profile can now create or accept Vouches." },
            { title: "Rule Accepted", description: "Both confirmations in time are required for release." },
          ]}
          primaryAction={{ label: "Open Dashboard" }}
        />
      </section>
    </main>
  )
}
