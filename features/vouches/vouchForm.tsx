// features/vouches/vouchForm.tsx

"use client"

import * as React from "react"
import { CalendarClock, CircleDollarSign, FileCheck2, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"

import { OnboardingRequirementNotice } from "@/components/vouches/onboarding-requirement-notice"
import { PageTitle } from "@/components/vouches/page-title"
import { VouchAmountField } from "@/components/vouches/vouch-amount-field"
import { VouchCreationCartRow } from "@/components/vouches/vouch-creation-cart-row"
import { VouchCreationWizard } from "@/components/vouches/vouch-creation-wizard"
import { VouchDateTimeField } from "@/components/vouches/vouch-date-time-field"
import { VouchDisclaimerAgreement } from "@/components/vouches/vouch-disclaimer-agreement"
import { openStripeConnectDashboard } from "@/lib/actions/paymentActions"
import { createVouch, getCreateVouchFormReadiness } from "@/lib/actions/vouchActions"
import {
  calculateProtocolFeeCents,
  formatCurrency,
  formatDateTime,
  parseAmountCents,
  toIsoFromLocalDateTime,
} from "@/lib/utils/vouchUtils"
import type { CreateVouchDraftFormValues, VouchFormStep } from "@/types/vouchTypes"

const defaultDraft: CreateVouchDraftFormValues = {
  disclaimerAccepted: false,
  appointmentStartsAt: "",
  amountDollars: "",
}

function normalizeDraft(input: Partial<CreateVouchDraftFormValues>): CreateVouchDraftFormValues {
  return {
    disclaimerAccepted: input.disclaimerAccepted ?? false,
    appointmentStartsAt: input.appointmentStartsAt ?? "",
    amountDollars: input.amountDollars ?? "",
  }
}

export function VouchForm() {
  const searchParams = useSearchParams()
  const form = useForm<CreateVouchDraftFormValues>({
    mode: "onBlur",
    defaultValues: defaultDraft,
  })

  const draft = useWatch({ control: form.control })
  const [currentStep, setCurrentStep] = React.useState(0)
  const [readinessChecked, setReadinessChecked] = React.useState(false)
  const [onboardingRequired, setOnboardingRequired] = React.useState(false)
  const [isReadinessPending, startReadinessTransition] = React.useTransition()
  const [isPending, startSubmitTransition] = React.useTransition()

  const formValues = normalizeDraft(draft)
  const amountCents = parseAmountCents(formValues.amountDollars)
  const protocolFeeCents = calculateProtocolFeeCents(amountCents)
  const appointmentIso = toIsoFromLocalDateTime(formValues.appointmentStartsAt)
  const disabled = !readinessChecked || onboardingRequired || isReadinessPending
  const rootError = form.formState.errors.root?.message

  React.useEffect(() => {
    const syncStripeConnectReturn = searchParams.has("stripe_connect_return")

    startReadinessTransition(() => {
      void (async () => {
        const readiness = await getCreateVouchFormReadiness({ syncStripeConnectReturn })
        const requiresOnboarding = !readiness.ok || readiness.data.onboardingRequired

        setOnboardingRequired(requiresOnboarding)
        setReadinessChecked(true)

        if (
          syncStripeConnectReturn &&
          requiresOnboarding &&
          !window.sessionStorage.getItem("stripe-connect-auto-continued")
        ) {
          window.sessionStorage.setItem("stripe-connect-auto-continued", "1")

          const formData = new FormData()
          formData.set("returnPath", "/vouches/new")

          await openStripeConnectDashboard(formData)
        }

        if (!requiresOnboarding) {
          window.sessionStorage.removeItem("stripe-connect-auto-continued")
        }
      })()
    })
  }, [searchParams])

  const canContinueDisclaimer = !disabled && formValues.disclaimerAccepted
  const canContinueAppointment = !disabled && Boolean(appointmentIso) && amountCents > 0

  function updateDraft(field: "disclaimerAccepted", value: boolean): void
  function updateDraft(field: "appointmentStartsAt" | "amountDollars", value: string): void
  function updateDraft(field: keyof CreateVouchDraftFormValues, value: string | boolean): void {
    if (disabled) return

    const options = {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    }

    if (field === "disclaimerAccepted" && typeof value === "boolean") {
      form.setValue(field, value, options)
    }

    if (field === "appointmentStartsAt" && typeof value === "string") {
      form.setValue(field, value, options)
    }

    if (field === "amountDollars" && typeof value === "string") {
      form.setValue(field, value, options)
    }

    form.clearErrors()
  }

  function applyFieldErrors(fieldErrors?: Record<string, string[]>): void {
    if (!fieldErrors) return

    const amountError = fieldErrors.amountCents?.[0]
    const appointmentError = fieldErrors.appointmentStartsAt?.[0]
    const disclaimerError = fieldErrors.disclaimerAccepted?.[0]

    if (amountError) form.setError("amountDollars", { message: amountError })
    if (appointmentError) form.setError("appointmentStartsAt", { message: appointmentError })
    if (disclaimerError) form.setError("disclaimerAccepted", { message: disclaimerError })
  }

  const submitVouch = form.handleSubmit(() => {
    if (disabled) return

    startSubmitTransition(() => {
      void (async () => {
        form.clearErrors()

        try {
          const result = await createVouch({
            amountCents,
            currency: "usd",
            appointmentStartsAt: appointmentIso,
            disclaimerAccepted: formValues.disclaimerAccepted,
          })

          if (!result.ok) {
            form.setError("root", {
              message: result.formError ?? "Unable to create this Vouch.",
            })
            applyFieldErrors(result.fieldErrors)
            return
          }

          window.location.assign(result.data.checkoutUrl ?? result.data.detailPath)
        } catch {
          form.setError("root", {
            message: "Stripe Checkout could not be opened. Try again.",
          })
        }
      })()
    })
  })

  const steps: VouchFormStep[] = [
    {
      id: "disclaimer",
      title: "Disclaimer",
      icon: <FileCheck2 className="h-8 w-8 text-white" />,
      canContinue: canContinueDisclaimer,
      content: (
        <VouchDisclaimerAgreement
          checked={formValues.disclaimerAccepted}
          disabled={disabled}
          error={form.formState.errors.disclaimerAccepted?.message}
          onCheckedChange={(checked) => updateDraft("disclaimerAccepted", checked)}
        />
      ),
    },
    {
      id: "appointment",
      title: "Appointment",
      icon: <CalendarClock className="h-8 w-8 text-white" />,
      canContinue: canContinueAppointment,
      content: (
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <label className="text-xl font-semibold text-white">
            Create a Vouch up to 24 hours before the appointment. The confirmation window is set
            from 1 hour before to 1 hour after the appointment.
          </label>
          <div className="mt-4 flex flex-col items-center gap-6 md:flex-row md:gap-16">
            <VouchDateTimeField
              value={formValues.appointmentStartsAt}
              disabled={disabled}
              error={form.formState.errors.appointmentStartsAt?.message}
              onChange={(value) => updateDraft("appointmentStartsAt", value)}
            />

            <VouchAmountField
              value={formValues.amountDollars}
              disabled={disabled}
              error={form.formState.errors.amountDollars?.message}
              onChange={(value) => updateDraft("amountDollars", value)}
            />
          </div>
        </div>
      ),
    },
    {
      id: "cart",
      title: "Review",
      icon: <CircleDollarSign className="h-8 w-8 text-white" />,
      canContinue: !disabled && !isPending,
      actionLabel: isPending ? "Opening Checkout" : "Pay protocol fee",
      content: (
        <div className="grid gap-5">
          {rootError ? (
            <div className="border-2 border-red-600 bg-red-600/10 p-3 text-sm leading-5 font-semibold text-white">
              {rootError}
            </div>
          ) : null}

          <div className="bg-black p-1">
            <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-neutral-400 pb-4">
              <div className="min-w-0">
                <p className="text-xs font-black tracking-widest text-blue-600 uppercase">
                  Review your
                </p>
                <p className="mt-1 text-xl leading-none font-black tracking-wide text-white uppercase">
                  Vouch details
                </p>
              </div>

              <ShieldCheck className="size-6 shrink-0 text-white" />
            </div>

            <div className="grid gap-3">
              <VouchCreationCartRow
                label="Appointment"
                value={formatDateTime(formValues.appointmentStartsAt)}
              />
              <VouchCreationCartRow label="Protected amount" value={formatCurrency(amountCents)} />
              <VouchCreationCartRow
                label="Protocol fee"
                value={`${formatCurrency(protocolFeeCents)} (5% min $5)`}
              />
              <VouchCreationCartRow
                label="Due now"
                value={formatCurrency(protocolFeeCents)}
                strong
              />
            </div>
          </div>

          <label className="mx-auto text-xl font-semibold text-white">
            After the protocol fee is paid, the customer authorization Checkout link becomes
            available on the Vouch detail page.
          </label>
        </div>
      ),
    },
  ]

  return (
    <div className="grid gap-8 md:gap-10">
      <PageTitle
        eyebrow="Create Vouch"
        title="New Vouch"
        description="Create the agreement, protect the appointment amount, and send the customer into the payment flow."
      />

      {onboardingRequired ? (
        <OnboardingRequirementNotice action={openStripeConnectDashboard} />
      ) : null}

      <VouchCreationWizard
        steps={steps}
        currentStep={currentStep}
        disabled={disabled}
        onStepChange={setCurrentStep}
        onComplete={submitVouch}
      />
    </div>
  )
}
