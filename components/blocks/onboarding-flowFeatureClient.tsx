"use client"

import * as React from "react"
import { BadgeCheck, Building, CreditCard, Shield, User } from "lucide-react"

import {
  CompletionScreen,
  GoalSelection,
  OnboardingWizard,
  ProfileSetup,
  WelcomeScreen,
  WorkspaceSetup,
} from "@/components/blocks/onboarding-flow"

const features = [
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Payment Setup",
    description: "Prepare provider-backed payment readiness.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Boundaries",
    description: "Confirm the deterministic release rule.",
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: "Confirm",
    description: "Know when and how to confirm presence.",
  },
]

const goals = [
  {
    id: "create",
    title: "Create Vouches",
    description: "Coordinate payer commitments.",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "accept",
    title: "Accept Vouches",
    description: "Prepare payout readiness.",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "confirm",
    title: "Confirm Presence",
    description: "Resolve agreements in time.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    id: "review",
    title: "Review State",
    description: "Track provider-backed outcomes.",
    icon: <Shield className="h-5 w-5" />,
  },
]

export function OnboardingFlowFeatureClient() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState("")
  const [interests, setInterests] = React.useState<string[]>([])
  const [workspaceName, setWorkspaceName] = React.useState("")
  const [memberEmail, setMemberEmail] = React.useState("")
  const [members, setMembers] = React.useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([])

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  function addMember() {
    if (!memberEmail || members.includes(memberEmail)) return
    setMembers((current) => [...current, memberEmail])
    setMemberEmail("")
  }

  function toggleGoal(goalId: string) {
    setSelectedGoals((current) =>
      current.includes(goalId) ? current.filter((item) => item !== goalId) : [...current, goalId]
    )
  }

  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <OnboardingWizard
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          steps={[
            {
              id: "profile",
              title: "Profile",
              description: "Identify the participant.",
              icon: <User className="h-7 w-7" />,
              content: (
                <p className="text-neutral-400">Add account details before creating a Vouch.</p>
              ),
            },
            {
              id: "payment",
              title: "Payment",
              description: "Prepare payment readiness.",
              icon: <CreditCard className="h-7 w-7" />,
              content: <p className="text-neutral-400">Connect provider-backed payment setup.</p>,
            },
            {
              id: "confirm",
              title: "Confirm",
              description: "Understand the confirmation window.",
              icon: <BadgeCheck className="h-7 w-7" />,
              content: <p className="text-neutral-400">Both parties must confirm in time.</p>,
            },
          ]}
        />
        <WelcomeScreen
          title="Welcome to Vouch"
          subtitle="Set up commitment-backed coordination."
          features={features}
          primaryAction={{ label: "Begin" }}
          secondaryAction={{ label: "Skip" }}
        />
        <ProfileSetup
          name={name}
          role={role}
          interests={interests}
          onNameChange={setName}
          onRoleChange={setRole}
          onInterestToggle={toggleInterest}
        />
        <WorkspaceSetup
          workspaceName={workspaceName}
          memberEmail={memberEmail}
          members={members}
          onWorkspaceNameChange={setWorkspaceName}
          onMemberEmailChange={setMemberEmail}
          onAddMember={addMember}
          onRemoveMember={(email) =>
            setMembers((current) => current.filter((item) => item !== email))
          }
          onSkip={() => undefined}
        />
        <GoalSelection goals={goals} selectedGoals={selectedGoals} onGoalToggle={toggleGoal} />
        <CompletionScreen
          features={[
            {
              title: "Account Ready",
              description: "Your profile can now create or accept Vouches.",
            },
            {
              title: "Rule Accepted",
              description: "Both confirmations in time are required for release.",
            },
          ]}
          primaryAction={{ label: "Open Dashboard" }}
        />
      </section>
    </main>
  )
}
