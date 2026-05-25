"use client"

import * as React from "react"

import { VouchCreationWizard } from "@/components/blocks/status"
import type { VouchCreationActionResult, VouchCreationDraft } from "@/components/blocks/status"
import { presentationContent } from "@/components/(presentation)/presentationContent"

export interface StatusFeatureClientProps {
  initialDraft?: Partial<VouchCreationDraft>
  onSaveAmount: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onSaveWindow: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onCreateVouch: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
}

const defaultDraft: VouchCreationDraft = {
  amountDollars: "50.00",
  appointmentStartsAt: "",
  confirmationOpensAt: "",
  confirmationExpiresAt: "",
  disclaimerAccepted: false,
}

export function StatusFeatureClient({
  initialDraft,
  onSaveAmount,
  onSaveWindow,
  onCreateVouch,
}: StatusFeatureClientProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [draft, setDraft] = React.useState<VouchCreationDraft>({ ...defaultDraft, ...initialDraft })
  const [savedSteps, setSavedSteps] = React.useState<Set<number>>(() => new Set())
  const [result, setResult] = React.useState<VouchCreationActionResult | null>(null)
  const [cartOpen, setCartOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [optimisticStep, setOptimisticStep] = React.useOptimistic(currentStep)

  const fieldErrors = result?.ok === false ? result.fieldErrors : undefined
  const formError = result?.ok === false ? result.formError : null
  const preview = result?.ok ? result.data : undefined

  function updateDraft(patch: Partial<VouchCreationDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setResult(null)
  }

  function markSaved(stepIndex: number) {
    setSavedSteps((current) => new Set(current).add(stepIndex))
  }

  function selectStep(stepIndex: number) {
    if (stepIndex <= currentStep || savedSteps.has(stepIndex - 1)) {
      setOptimisticStep(stepIndex)
      setCurrentStep(stepIndex)
      setResult(null)
    }
  }

  function runStep(action: () => Promise<VouchCreationActionResult>, nextStep?: number) {
    startTransition(async () => {
      setResult(null)
      if (typeof nextStep === "number") setOptimisticStep(nextStep)

      const nextResult = await action()
      setResult(nextResult)
      if (!nextResult.ok) return

      markSaved(currentStep)
      if (typeof nextStep === "number") {
        setCurrentStep(nextStep)
        return
      }

      const destination = nextResult.data?.checkoutUrl ?? nextResult.data?.detailPath
      if (destination) window.location.assign(destination)
    })
  }

  function goBack() {
    const nextStep = Math.max(currentStep - 1, 0)
    setOptimisticStep(nextStep)
    setCurrentStep(nextStep)
    setResult(null)
  }

  return (
    <VouchCreationWizard
      content={presentationContent.wizard}
      currentStep={currentStep}
      optimisticStep={optimisticStep}
      savedStepIndexes={[...savedSteps]}
      draft={draft}
      preview={preview}
      fieldErrors={fieldErrors}
      formError={formError}
      cartOpen={cartOpen}
      isPending={isPending}
      onDraftChange={updateDraft}
      onStepSelect={selectStep}
      onBack={goBack}
      onSaveAmount={() => runStep(() => onSaveAmount(draft), 1)}
      onSaveWindow={() => runStep(() => onSaveWindow(draft), 2)}
      onReviewCart={() => setCartOpen(true)}
      onCartOpenChange={setCartOpen}
      onCreateVouch={() => runStep(() => onCreateVouch(draft))}
    />
  )
}
