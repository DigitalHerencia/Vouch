"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Building,
  Target,
  Sparkles,
  PartyPopper,
  Upload,
} from "lucide-react"

// ============================================================================
// ONBOARDING VARIANT 1: Step Wizard
// ============================================================================
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
  onComplete?: () => void
  onStepChange?: (stepIndex: number) => void
  showProgress?: boolean
}

export function OnboardingWizard({
  steps,
  onComplete,
  onStepChange,
  showProgress = true,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const progress = ((currentStep + 1) / steps.length) * 100
  const step = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      onStepChange?.(currentStep + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      onStepChange?.(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (step?.optional) {
      handleNext()
    }
  }

  if (!step) return null

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      {showProgress && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold tracking-wide uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-neutral-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      )}

      {/* Step Indicators */}
      <div
        className="mb-8 flex items-center justify-center gap-2"
        role="list"
        aria-label="Progress steps"
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              role="listitem"
              aria-label={`Step ${index + 1} of ${steps.length}: ${step.title}`}
              aria-current={index === currentStep ? "step" : undefined}
              className={
                index < currentStep
                  ? "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-blue-600 font-bold text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                  : index === currentStep
                    ? "flex h-10 w-10 scale-110 items-center justify-center border-3 border-neutral-400 bg-blue-600 font-bold text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                    : "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-neutral-900 font-bold text-neutral-400 transition-all"
              }
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={
                  index < currentStep
                    ? "h-1 w-8 bg-blue-600 transition-colors"
                    : "h-1 w-8 bg-neutral-900 transition-colors"
                }
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader className="text-center">
          {step.icon && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              {step.icon}
            </div>
          )}
          <CardTitle className="text-2xl font-black uppercase">{step.title}</CardTitle>
          {step.description && <CardDescription>{step.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {step.content}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {step.optional && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Complete" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================`r`n// ONBOARDING VARIANT 2: Welcome Screen`r`n// ============================================================================
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
          {logo && (
            <div className="mx-auto flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]">
              {logo}
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">{title}</h2>
            <p className="text-lg text-neutral-400">{subtitle}</p>
          </div>

          {features && features.length > 0 && (
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
          )}

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryAction && (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// ONBOARDING VARIANT 3: User Profile Setup
// ============================================================================
export interface ProfileSetupProps {
  onSubmit?: (data: { name: string; role: string; avatar?: File; interests: string[] }) => void
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
  { value: "data", label: "Data Science" },
  { value: "devops", label: "DevOps" },
]

export function ProfileSetup({
  onSubmit,
  availableRoles = defaultRoles,
  availableInterests = defaultInterests,
}: ProfileSetupProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    role: "",
    interests: [] as string[],
  })
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarFile, setAvatarFile] = React.useState<File | undefined>(undefined)
  const [avatarError, setAvatarError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5MB.")
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const toggleInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter((i) => i !== interest)
        : [...formData.interests, interest],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(avatarFile ? { ...formData, avatar: avatarFile } : formData)
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <User className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black uppercase">Set Up Your Profile</CardTitle>
        <CardDescription>Tell us a bit about yourself</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-24 w-24 items-center justify-center border-3 border-dashed border-neutral-400 bg-neutral-900 transition-colors hover:bg-neutral-900"
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
            {avatarError && <p className="text-sm font-medium text-red-600">{avatarError}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase">
              Your Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="What should we call you?"
              required
              className="border-2 border-neutral-400"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Your Role</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableRoles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={
                    formData.role === role.value
                      ? "border-2 border-neutral-400 bg-blue-600 p-2 text-sm font-medium text-white shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                      : "border-2 border-neutral-400 bg-black p-2 text-sm font-medium transition-all hover:bg-neutral-900"
                  }
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">
              Your Interests <span className="text-neutral-400">(Select all that apply)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availableInterests.map((interest) => (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => toggleInterest(interest.value)}
                  className={
                    formData.interests.includes(interest.value)
                      ? "flex items-center gap-2 border-2 border-neutral-400 bg-neutral-900 p-2 text-sm font-medium text-white shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                      : "flex items-center gap-2 border-2 border-neutral-400 bg-black p-2 text-sm font-medium transition-all hover:bg-neutral-900"
                  }
                >
                  <div
                    className={
                      formData.interests.includes(interest.value)
                        ? "flex h-4 w-4 items-center justify-center border-2 border-neutral-400 bg-blue-600"
                        : "flex h-4 w-4 items-center justify-center border-2 border-neutral-400"
                    }
                  >
                    {formData.interests.includes(interest.value) && (
                      <Check className="h-3 w-3 text-neutral-400" />
                    )}
                  </div>
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ONBOARDING VARIANT 4: Workspace/Team Setup
// ============================================================================
export interface WorkspaceSetupProps {
  children?: React.ReactNode
  title?: string
  description?: string
  onSubmit?: (data: { name: string; members: string[] }) => void
  onSkip?: () => void
}

export function WorkspaceSetup({
  children,
  title = "Create Your Workspace",
  description = "Set up your team workspace and invite members",
  onSubmit,
  onSkip,
}: WorkspaceSetupProps) {
  const [workspaceName, setWorkspaceName] = React.useState("")
  const [memberEmail, setMemberEmail] = React.useState("")
  const [members, setMembers] = React.useState<string[]>([])

  const addMember = () => {
    if (memberEmail && !members.includes(memberEmail)) {
      setMembers([...members, memberEmail])
      setMemberEmail("")
    }
  }

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m !== email))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ name: workspaceName, members })
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Building className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black uppercase">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children || (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workspace" className="text-xs font-bold uppercase">
                Workspace Name
              </Label>
              <Input
                id="workspace"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Acme Inc."
                required
                className="border-2 border-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite" className="text-xs font-bold uppercase">
                Invite Team Members <span className="text-neutral-400">(Optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="colleague@email.com"
                  className="border-2 border-neutral-400"
                />
                <Button type="button" variant="outline" onClick={addMember}>
                  Add
                </Button>
              </div>
            </div>

            {members.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-400 uppercase">
                  Pending Invites ({members.length})
                </p>
                <div className="space-y-2">
                  {members.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between border-2 border-neutral-400 bg-neutral-900 p-2"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(email)}
                        className="text-neutral-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {onSkip && (
                <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
                  Skip for Now
                </Button>
              )}
              <Button type="submit" className="flex-1">
                Create Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ONBOARDING VARIANT 5: Goal Selection
// ============================================================================
export interface GoalSelectionProps {
  goals: Array<{
    id: string
    title: string
    description: string
    icon: React.ReactNode
  }>
  onSubmit?: (selectedGoals: string[]) => void
  minSelection?: number
  maxSelection?: number
}

export function GoalSelection({
  goals,
  onSubmit,
  minSelection = 1,
  maxSelection = 3,
}: GoalSelectionProps) {
  const [selected, setSelected] = React.useState<string[]>([])

  const toggleGoal = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id))
    } else if (selected.length < maxSelection) {
      setSelected([...selected, id])
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center border-3 border-neutral-400 bg-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
          <Target className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black uppercase">What are your goals?</CardTitle>
        <CardDescription>
          Select up to {maxSelection} goals to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={
                selected.includes(goal.id)
                  ? "flex -translate-x-0.5 -translate-y-0.5 items-start gap-4 border-3 border-neutral-400 bg-blue-600 p-4 text-left shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                  : "flex items-start gap-4 border-3 border-neutral-400 bg-black p-4 text-left transition-all hover:bg-neutral-900"
              }
            >
              <div
                className={
                  selected.includes(goal.id)
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
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => onSubmit?.(selected)}
          disabled={selected.length < minSelection}
        >
          Continue with {selected.length} goal{selected.length !== 1 ? "s" : ""}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ONBOARDING VARIANT 6: Completion Screen
// ============================================================================
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center border-3 border-neutral-400 bg-blue-600 text-white shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]">
          <PartyPopper className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
          <p className="text-neutral-400">{subtitle}</p>
        </div>

        {features && features.length > 0 && (
          <div className="space-y-3 text-left">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 border-2 border-neutral-400 bg-neutral-900 p-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">{feature.title}</p>
                  <p className="text-xs text-neutral-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {primaryAction && (
          <Button size="lg" className="w-full" onClick={primaryAction.onClick}>
            <Sparkles className="mr-2 h-4 w-4" />
            {primaryAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const OnboardingFlow = {
  Wizard: OnboardingWizard,
  Welcome: WelcomeScreen,
  ProfileSetup: ProfileSetup,
  WorkspaceSetup: WorkspaceSetup,
  GoalSelection: GoalSelection,
  Completion: CompletionScreen,
}
