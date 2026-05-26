import * as React from "react"
import {
  BadgeCheck,
  Building,
  Check,
  Handshake,
  PartyPopper,
  Target,
  Upload,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export interface OnboardingStep {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  content: React.ReactNode
  optional?: boolean
}

export interface OnboardingWizardProps {
  steps: OnboardingStep[]
  currentStep: number
  onStepChange: (stepIndex: number) => void
  onComplete?: () => void
  showProgress?: boolean
}

export function OnboardingWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  showProgress = true,
}: OnboardingWizardProps) {
  const step = steps[currentStep]
  const progress = steps.length ? ((currentStep + 1) / steps.length) * 100 : 0

  if (!step) return null

  function goNext() {
    if (currentStep < steps.length - 1) onStepChange(currentStep + 1)
    else onComplete?.()
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {showProgress ? (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold tracking-wide uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-neutral-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      ) : null}

      <div
        className="mb-8 flex items-center justify-center gap-2"
        role="list"
        aria-label="Progress steps"
      >
        {steps.map((item, index) => (
          <React.Fragment key={item.id}>
            <button
              type="button"
              role="listitem"
              aria-label={`Step ${index + 1} of ${steps.length}: ${item.title}`}
              aria-current={index === currentStep ? "step" : undefined}
              onClick={() => onStepChange(index)}
              className={
                index <= currentStep
                  ? "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-blue-600 font-bold text-white transition-all"
                  : "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-neutral-900 font-bold text-neutral-400 transition-all"
              }
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </button>
            {index < steps.length - 1 ? (
              <div
                className={index < currentStep ? "h-1 w-8 bg-blue-600" : "h-1 w-8 bg-neutral-900"}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4 text-center">
          {step.icon ? (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              {step.icon}
            </div>
          ) : null}
          <CardTitle className="text-6xl font-black uppercase">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {step.description ? (
            <CardDescription className="text-2xl font-black uppercase">
              {step.description}
            </CardDescription>
          ) : null}
          {step.content}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step.optional ? (
                <Button variant="ghost" onClick={goNext}>
                  Skip
                </Button>
              ) : null}
              <Button onClick={goNext}>
                {currentStep === steps.length - 1 ? "Complete" : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export interface WelcomeScreenProps {
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  features?: Array<{ icon: React.ReactNode; title: string; description: string }>
  primaryAction?: { label: string; onClick?: () => void }
  secondaryAction?: { label: string; onClick?: () => void }
}

export function WelcomeScreen({
  logo,
  title = "Welcome to the app",
  subtitle = "Let's get you started with a quick setup",
  features,
  primaryAction,
  secondaryAction,
}: WelcomeScreenProps) {
  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <Card>
        <CardContent className="space-y-8 pt-8 pb-8">
          {logo ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
              {logo}
            </div>
          ) : null}
          <div className="space-y-2">
            <h3 className="font-black tracking-tight uppercase">{title}</h3>
            <p className="text-lg text-neutral-400">{subtitle}</p>
          </div>
          {features?.length ? (
            <div className="grid gap-4 text-left md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="space-y-2 border-3 border-neutral-400 bg-black p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-neutral-400 bg-blue-600">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold">{feature.title}</h4>
                  <p className="text-sm text-neutral-400">{feature.description}</p>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryAction ? (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export interface ProfileSetupProps {
  name: string
  role: string
  interests: string[]
  avatarPreview?: string | null
  avatarError?: string | null
  onNameChange: (name: string) => void
  onRoleChange: (role: string) => void
  onInterestToggle: (interest: string) => void
  onAvatarInputClick?: () => void
  onAvatarChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: () => void
  availableRoles?: Array<{ value: string; label: string }>
  availableInterests?: Array<{ value: string; label: string }>
}

const defaultRoles = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Product Manager" },
]

const defaultInterests = [
  { value: "web", label: "Web Development" },
  { value: "mobile", label: "Mobile Apps" },
  { value: "ai", label: "AI & Machine Learning" },
  { value: "design", label: "UI/UX Design" },
]

export function ProfileSetup({
  name,
  role,
  interests,
  avatarPreview,
  avatarError,
  onNameChange,
  onRoleChange,
  onInterestToggle,
  onAvatarInputClick,
  onAvatarChange,
  onSubmit,
  availableRoles = defaultRoles,
  availableInterests = defaultInterests,
}: ProfileSetupProps) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <User className="h-7 w-7" />
        </div>
        <CardTitle className="text-6xl font-black uppercase">Set Up Your Profile</CardTitle>
        <CardDescription>Tell us a bit about yourself</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit?.()
          }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onAvatarInputClick}
              className="relative flex h-24 w-24 items-center justify-center border-3 border-dashed border-neutral-400 bg-neutral-900"
            >
              {avatarPreview ? (
                <span
                  aria-label="Avatar preview"
                  role="img"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarPreview})` }}
                />
              ) : (
                <Upload className="h-8 w-8 text-neutral-400" />
              )}
              <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
            </button>
            {avatarError ? <p className="text-sm font-medium text-red-600">{avatarError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase">
              Your Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              required
              className="border-2 border-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Your Role</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableRoles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onRoleChange(item.value)}
                  className={
                    role === item.value
                      ? "border-2 border-neutral-400 bg-blue-600 p-2 text-sm font-medium text-white shadow-[3px_3px_0px_black]"
                      : "border-2 border-neutral-400 bg-black p-2 text-sm font-medium hover:bg-neutral-900"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">
              Your Interests <span className="text-neutral-400">(Select all that apply)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availableInterests.map((item) => {
                const active = interests.includes(item.value)
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onInterestToggle(item.value)}
                    className={
                      active
                        ? "flex items-center gap-2 border-2 border-neutral-400 bg-neutral-900 p-2 text-sm font-medium text-white shadow-[3px_3px_0px_black]"
                        : "flex items-center gap-2 border-2 border-neutral-400 bg-black p-2 text-sm font-medium hover:bg-neutral-900"
                    }
                  >
                    <span
                      className={
                        active
                          ? "flex h-4 w-4 items-center justify-center border-2 border-neutral-400 bg-blue-600"
                          : "flex h-4 w-4 items-center justify-center border-2 border-neutral-400"
                      }
                    >
                      {active ? <Check className="h-3 w-3 text-white" /> : null}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export interface WorkspaceSetupProps {
  title?: string
  description?: string
  workspaceName: string
  memberEmail: string
  members: string[]
  onWorkspaceNameChange: (name: string) => void
  onMemberEmailChange: (email: string) => void
  onAddMember: () => void
  onRemoveMember: (email: string) => void
  onSubmit?: () => void
  onSkip?: () => void
}

export function WorkspaceSetup({
  title = "Create Your Workspace",
  description = "Set up your team workspace and invite members",
  workspaceName,
  memberEmail,
  members,
  onWorkspaceNameChange,
  onMemberEmailChange,
  onAddMember,
  onRemoveMember,
  onSubmit,
  onSkip,
}: WorkspaceSetupProps) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Building className="h-7 w-7" />
        </div>
        <CardTitle className="text-6xl font-black uppercase">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit?.()
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="workspace" className="text-xs font-bold uppercase">
              Workspace Name
            </Label>
            <Input
              id="workspace"
              value={workspaceName}
              onChange={(event) => onWorkspaceNameChange(event.target.value)}
              required
              className="border-2 border-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite" className="text-xs font-bold uppercase">
              Invite Team Members <span className="text-neutral-400">(Optional)</span>
            </Label>
            <div className="flex gap-4">
              <Input
                id="invite"
                type="email"
                value={memberEmail}
                onChange={(event) => onMemberEmailChange(event.target.value)}
                className="border-2 border-neutral-400"
              />
              <Button type="button" variant="outline" size="default" onClick={onAddMember}>
                Add
              </Button>
            </div>
          </div>
          {members.length ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase">
                Pending Invites ({members.length})
              </p>
              {members.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between border-2 border-neutral-400 bg-neutral-900 p-2"
                >
                  <span className="text-sm">{email}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveMember(email)}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex gap-3">
            {onSkip ? (
              <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
                Skip for Now
              </Button>
            ) : null}
            <Button type="submit">Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export interface GoalSelectionProps {
  goals: Array<{ id: string; title: string; description: string; icon: React.ReactNode }>
  selectedGoals: string[]
  onGoalToggle: (goalId: string) => void
  onSubmit?: () => void
  minSelection?: number
  maxSelection?: number
}

export function GoalSelection({
  goals,
  selectedGoals,
  onGoalToggle,
  onSubmit,
  minSelection = 1,
  maxSelection = 3,
}: GoalSelectionProps) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Target className="h-7 w-7" />
        </div>
        <CardTitle className="text-6xl font-black uppercase">What are your goals?</CardTitle>
        <CardDescription>
          Select up to {maxSelection} goals to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => {
            const active = selectedGoals.includes(goal.id)
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onGoalToggle(goal.id)}
                disabled={!active && selectedGoals.length >= maxSelection}
                className={
                  active
                    ? "flex items-start gap-4 border-3 border-neutral-400 bg-blue-600 p-4 text-left"
                    : "flex items-start gap-4 border-3 border-neutral-400 bg-black p-4 text-left disabled:opacity-50"
                }
              >
                <div
                  className={
                    active
                      ? "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-neutral-400 bg-neutral-900 text-white"
                      : "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600"
                  }
                >
                  {goal.icon}
                </div>
                <div>
                  <h3 className="font-bold">{goal.title}</h3>
                  <p className="text-sm text-neutral-400">{goal.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={onSubmit}
          disabled={selectedGoals.length < minSelection}
        >
          Continue with {selectedGoals.length} goal{selectedGoals.length !== 1 ? "s" : ""}
        </Button>
      </CardContent>
    </Card>
  )
}

export interface CompletionScreenProps {
  title?: string
  subtitle?: string
  features?: Array<{ title: string; description: string }>
  primaryAction?: { label: string; onClick?: () => void }
}

export function CompletionScreen({
  title = "You're all set!",
  subtitle = "Your account is ready to go. Here are some things you can do next:",
  features,
  primaryAction,
}: CompletionScreenProps) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="space-y-6 pt-8 pb-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-black text-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Handshake className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
          <p className="text-neutral-400">{subtitle}</p>
        </div>
        {features?.length ? (
          <div className="space-y-3 text-left">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 border-2 border-neutral-400 bg-neutral-900 p-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-white">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">{feature.title}</p>
                  <p className="text-xs text-neutral-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {primaryAction ? (
          <Button size="lg" className="w-full" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export const OnboardingFlow = {
  Wizard: OnboardingWizard,
  Welcome: WelcomeScreen,
  ProfileSetup: ProfileSetup,
  WorkspaceSetup: WorkspaceSetup,
  GoalSelection: GoalSelection,
  Completion: CompletionScreen,
}
