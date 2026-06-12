// components/vouches/vouch-creation-wizard.tsx

import { Fragment } from "react"
import { Check } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { vouchPageCopy } from "@/content/vouches"
import type { VouchFormStep } from "@/types/vouchTypes"

export type VouchCreationWizardProps = {
  steps: VouchFormStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete?: () => void
  showProgress?: boolean
  disabled?: boolean
}

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

  function goNext(): void {
    if (!step) return
    if (disabled) return
    if (step.canContinue === false) return

    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
      return
    }

    onComplete?.()
  }

  return (
    <section className="px-4 py-8 md:px-8 lg:px-16">
      {showProgress ? (
        <div className="mx-auto mb-8 grid w-full max-w-5xl gap-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-black tracking-widest text-white uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-mono text-sm font-bold text-neutral-400">
              {Math.round(progress)}% complete
            </span>
          </div>

          <Progress value={progress} className="h-3" />
        </div>
      ) : null}

      <div
        className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-center gap-2"
        role="list"
        aria-label={vouchPageCopy.create.progressLabel}
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
                  ? "flex h-11 w-11 items-center justify-center border-3 border-neutral-400 bg-blue-600 text-base font-black text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  : "flex h-11 w-11 items-center justify-center border-3 border-neutral-400 bg-neutral-950 text-base font-black text-neutral-400 transition-all disabled:cursor-not-allowed disabled:opacity-50"
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

      <Card className="mx-auto w-full max-w-5xl overflow-hidden border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <CardHeader className="border-b-3 border-neutral-400 px-6 py-8 text-center md:px-8 md:py-10">
          {step.icon ? (
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              {step.icon}
            </div>
          ) : null}

          <CardTitle className="text-4xl leading-none font-black tracking-tight text-white uppercase md:text-5xl lg:text-6xl">
            {step.title}
          </CardTitle>

          {step.description ? (
            <CardDescription className="mx-auto max-w-2xl text-sm leading-6 font-semibold text-neutral-400 md:text-base">
              {step.description}
            </CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-8 px-6 py-8 md:px-8">
          <div>{step.content}</div>

          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
              disabled={disabled || currentStep === 0}
            >
              Back
            </Button>

            <section>
              <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
                <Image
                  src="/Powered by Stripe - white.svg"
                  alt="Powered by Stripe"
                  width={150}
                  height={34}
                  className="h-auto w-36"
                  priority={false}
                />
              </div>
            </section>

            <Button
              type="button"
              onClick={goNext}
              disabled={disabled || step.canContinue === false}
            >
              {currentStep === steps.length - 1 ? (step.actionLabel ?? "Complete") : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
