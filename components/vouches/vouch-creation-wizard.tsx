import { Fragment } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function VouchCreationWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  showProgress = true,
  disabled = false,
}: VouchCreationWizardProps) {
  const step = steps[currentStep]
  const progress = steps.length ? ((currentStep + 1) / steps.length) * 100 : 0

  if (!step) return null
  const current = step

  function goNext() {
    if (disabled) return
    if (current.canContinue === false) return
    if (currentStep < steps.length - 1) onStepChange(currentStep + 1)
    else onComplete?.()
  }

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16">
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
          <Fragment key={item.id}>
            <button
              type="button"
              role="listitem"
              aria-label={`Step ${index + 1} of ${steps.length}: ${item.title}`}
              aria-current={index === currentStep ? "step" : undefined}
              onClick={() => onStepChange(index)}
              disabled={disabled}
              className={
                index <= currentStep
                  ? "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-blue-600 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  : "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-neutral-900 font-bold text-neutral-400 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </button>
            {index < steps.length - 1 ? (
              <div
                className={index < currentStep ? "h-1 w-8 bg-blue-600" : "h-1 w-8 bg-neutral-900"}
              />
            ) : null}
          </Fragment>
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
              type="button"
              variant="outline"
              onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
              disabled={disabled || currentStep === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step.optional ? (
                <Button type="button" variant="ghost" onClick={goNext} disabled={disabled}>
                  Skip
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={goNext}
                disabled={disabled || step.canContinue === false}
              >
                {currentStep === steps.length - 1 ? (step.actionLabel ?? "Complete") : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
