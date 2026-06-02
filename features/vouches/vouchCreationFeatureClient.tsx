"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"

import { VouchCreationWizard } from "@/components/blocks/status"
import { vouchPageCopy } from "@/content/vouches"
import type { ActionResult } from "@/types/action-resultTypes"

export type VouchCreationDraft = {
  amountDollars: string
  appointmentStartsAt: string
  confirmationOpensAt: string
  confirmationExpiresAt: string
  disclaimerAccepted: boolean
}

type VouchCreationPreviewData = {
  amountCents: number
  currency: "usd"
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  totalCents: number
  vouchId?: string
  detailPath?: string
  checkoutUrl?: string
}

type CreatedVouchData = {
  vouchId: string
  detailPath: string
  checkoutUrl?: string
}

export type VouchCreationActionResult = ActionResult<VouchCreationPreviewData | CreatedVouchData>

type VouchCreationWizardContent = {
  eyebrow: string
  title: string
  helper: string
  progressHint: string
  amountDescription: string
  cartTitle: string
  cartDescription: string
  immutableAcknowledgement: string
  steps: Array<{
    title: string
    completeLabel: string
    pendingLabel: string
  }>
  protocolTiles: Array<{
    title: string
    body: string
  }>
  cartRail: Array<{
    label: string
    value: string
  }>
}

type VouchCreationFeatureClientProps = {
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

const wizardContent: VouchCreationWizardContent = {
  eyebrow: vouchPageCopy.create.eyebrow,
  title: vouchPageCopy.create.title,
  helper: vouchPageCopy.create.readyBody,
  progressHint: "Provider truth required",
  amountDescription: vouchPageCopy.create.feeBody,
  cartTitle: vouchPageCopy.create.reviewTitle,
  cartDescription: vouchPageCopy.create.reviewBody,
  immutableAcknowledgement: vouchPageCopy.create.disclaimerLabel,
  steps: [
    { title: "Fee invoice", completeLabel: "OK", pendingLabel: "..." },
    { title: "Confirmation window", completeLabel: "OK", pendingLabel: "..." },
    { title: "Commit Vouch", completeLabel: "OK", pendingLabel: "..." },
  ],
  protocolTiles: [
    {
      title: vouchPageCopy.create.hostedPaymentTitle,
      body: vouchPageCopy.create.hostedPaymentBody,
    },
    {
      title: vouchPageCopy.create.ruleTitle,
      body: vouchPageCopy.create.ruleBody,
    },
    {
      title: "Server authority",
      body: "Create, fee calculation, and provider redirects stay behind server actions.",
    },
  ],
  cartRail: [
    {
      label: "1. Validate terms",
      value: "Server validation checks the amount and confirmation window before commitment.",
    },
    {
      label: "2. Commit draft",
      value: "The server creates the immutable Vouch and records the workflow state.",
    },
    {
      label: "3. Hosted fee payment",
      value: "Stripe hosts the merchant fee payment surface and returns provider state.",
    },
  ],
}

export function VouchCreationFeatureClient({
  initialDraft,
  onSaveAmount,
  onSaveWindow,
  onCreateVouch,
}: VouchCreationFeatureClientProps) {
  const form = useForm<VouchCreationDraft>({
    defaultValues: { ...defaultDraft, ...initialDraft },
  })
  const [currentStep, setCurrentStep] = React.useState(0)
  const [savedSteps, setSavedSteps] = React.useState<Set<number>>(() => new Set())
  const [result, setResult] = React.useState<VouchCreationActionResult | null>(null)
  const [cartOpen, setCartOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [optimisticStep, setOptimisticStep] = React.useOptimistic(currentStep)
  const draft = useWatch({
    control: form.control,
    defaultValue: { ...defaultDraft, ...initialDraft },
  }) as VouchCreationDraft

  const fieldErrors = result?.ok === false ? result.fieldErrors : undefined
  const formError = result?.ok === false ? result.formError : null
  const preview = result?.ok && "amountCents" in result.data ? result.data : undefined

  function updateDraft(patch: Partial<VouchCreationDraft>) {
    for (const [key, value] of Object.entries(patch) as Array<
      [keyof VouchCreationDraft, VouchCreationDraft[keyof VouchCreationDraft]]
    >) {
      form.setValue(key, value, {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
    setResult(null)
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

      setSavedSteps((current) => new Set(current).add(currentStep))

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
      content={wizardContent}
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
