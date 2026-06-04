"use client"

import * as React from "react"
import { CalendarClock, CircleDollarSign, FileCheck2, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"

import { OnboardingRequirementNotice } from "@/components/shared/cta-section"
import {
  VouchCreationCartRow,
  VouchCreationField,
  VouchCreationWizard,
} from "@/components/vouches/status"
import { Button, Checkbox, Input } from "@/components/vouches/form-controls"
import { openStripeConnectDashboard } from "@/lib/actions/paymentActions"
import { createVouch, getCreateVouchFormReadiness } from "@/lib/actions/vouchActions"

type CreateVouchDraft = {
  disclaimerAccepted: boolean
  appointmentStartsAt: string
  amountDollars: string
}

const defaultDraft: CreateVouchDraft = {
  disclaimerAccepted: false,
  appointmentStartsAt: "",
  amountDollars: "",
}

function parseAmountCents(value: string | undefined) {
  const amount = Number((value ?? "").trim().replace(/[$,\s]/g, ""))
  if (!Number.isFinite(amount)) return 0

  return Math.round(amount * 100)
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function calculateProtocolFeeCents(amountCents: number) {
  if (amountCents <= 0) return 0

  return Math.max(Math.ceil(amountCents * 0.05), 500)
}

function calculateStripeFeeCents(amountCents: number) {
  if (amountCents <= 0) return 0

  return Math.ceil((amountCents + 30) / (1 - 0.029) - amountCents)
}

function toIsoFromLocalDateTime(value: string | undefined) {
  if (!value) return ""

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function formatDateTime(value: string | undefined) {
  if (!value) return "Select an appointment"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Select an appointment"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function VouchForm() {
  const form = useForm<CreateVouchDraft>({
    mode: "onBlur",
    defaultValues: defaultDraft,
  })
  const draft = useWatch({ control: form.control })
  const [currentStep, setCurrentStep] = React.useState(0)
  const [readinessChecked, setReadinessChecked] = React.useState(false)
  const [onboardingRequired, setOnboardingRequired] = React.useState(false)
  const [isReadinessPending, startReadinessTransition] = React.useTransition()
  const [isPending, startTransition] = React.useTransition()

  const formValues: CreateVouchDraft = {
    disclaimerAccepted: draft.disclaimerAccepted ?? false,
    appointmentStartsAt: draft.appointmentStartsAt ?? "",
    amountDollars: draft.amountDollars ?? "",
  }

  const amountCents = parseAmountCents(formValues.amountDollars)
  const protocolFeeCents = calculateProtocolFeeCents(amountCents)
  const stripeFeeCents = calculateStripeFeeCents(protocolFeeCents)
  const totalDueNowCents = protocolFeeCents + stripeFeeCents
  const appointmentIso = toIsoFromLocalDateTime(formValues.appointmentStartsAt)
  const disabled = !readinessChecked || onboardingRequired || isReadinessPending
  const rootError = form.formState.errors.root?.message

  React.useEffect(() => {
    startReadinessTransition(async () => {
      const readiness = await getCreateVouchFormReadiness()
      setOnboardingRequired(!readiness.ok || readiness.data.onboardingRequired)
      setReadinessChecked(true)
    })
  }, [])

  const canContinueDisclaimer = !disabled && formValues.disclaimerAccepted
  const canContinueAppointment = !disabled && Boolean(appointmentIso) && amountCents > 0

  function updateDraft(field: "disclaimerAccepted", value: boolean): void
  function updateDraft(field: "appointmentStartsAt" | "amountDollars", value: string): void
  function updateDraft(field: keyof CreateVouchDraft, value: string | boolean) {
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

  function applyFieldErrors(fieldErrors?: Record<string, string[]>) {
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

    startTransition(async () => {
      form.clearErrors()

      const result = await createVouch({
        amountCents,
        currency: "usd",
        appointmentStartsAt: appointmentIso,
        disclaimerAccepted: formValues.disclaimerAccepted,
      })

      if (!result.ok) {
        form.setError("root", { message: result.formError ?? "Unable to create this Vouch." })
        applyFieldErrors(result.fieldErrors)
        return
      }

      window.location.assign(result.data.checkoutUrl ?? result.data.detailPath)
    })
  })

  const steps = [
    {
      id: "disclaimer",
      title: "Disclaimer",
      icon: <FileCheck2 className="h-8 w-8 text-white" />,
      canContinue: canContinueDisclaimer,
      content: (
        <div className="grid gap-4">
          <label className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 bg-black p-1">
            <Checkbox
              checked={formValues.disclaimerAccepted}
              disabled={disabled}
              onCheckedChange={(checked) => updateDraft("disclaimerAccepted", checked === true)}
              className="mt-1 border-neutral-400"
            />
            <span className="max-w-prose text-sm leading-6 font-semibold text-neutral-300">
              Vouch coordinates payment state through third-party providers. Vouch does not directly
              custody funds, hold card data, store bank data, or act as a funds custodian.
              <span className="mt-3 block">
                I agree to the
                <Button asChild variant="nav" size="nav" className="ml-2">
                  <Link href="/legal/disclaimer" target="_blank" rel="noreferrer">
                    Disclaimer
                  </Link>
                </Button>
                .
              </span>
            </span>
          </label>
          {form.formState.errors.disclaimerAccepted?.message ? (
            <p className="text-sm leading-5 font-semibold text-red-600">
              {form.formState.errors.disclaimerAccepted.message}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "appointment",
      title: "Appointment",
      description: "Choose the appointment and protected amount.",
      icon: <CalendarClock className="h-8 w-8 text-white" />,
      canContinue: canContinueAppointment,
      content: (
        <div className="grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <VouchCreationField
              label="Appointment date and time"
              error={form.formState.errors.appointmentStartsAt?.message}
            >
              <Input
                type="datetime-local"
                value={formValues.appointmentStartsAt}
                disabled={disabled}
                onChange={(event) => updateDraft("appointmentStartsAt", event.target.value)}
                className="h-12 rounded-none border-2 border-neutral-400 bg-black px-3 font-mono text-sm font-bold text-white disabled:opacity-50"
              />
            </VouchCreationField>
            <VouchCreationField
              label="Protected amount"
              error={form.formState.errors.amountDollars?.message}
            >
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="250.00"
                value={formValues.amountDollars}
                disabled={disabled}
                onChange={(event) => updateDraft("amountDollars", event.target.value)}
                className="h-12 rounded-none border-2 border-neutral-400 bg-black px-3 font-mono text-sm font-bold text-white disabled:opacity-50"
              />
            </VouchCreationField>
          </div>
          <p className="max-w-prose text-sm leading-6 font-semibold text-neutral-300">
            Create a Vouch up to 24 hours before the appointment. The confirmation window is
            automatically set from 1 hour before to 1 hour after the appointment time you choose.
          </p>
        </div>
      ),
    },
    {
      id: "cart",
      title: "Review",
      description: "Confirm the fee due now before opening Stripe Checkout.",
      icon: <CircleDollarSign className="h-8 w-8 text-white" />,
      canContinue: !disabled && !isPending,
      actionLabel: isPending ? "Opening Checkout" : "Pay protocol fee",
      content: (
        <div className="grid gap-5">
          {rootError ? (
            <div className="border border-red-600 bg-red-600/10 p-3 text-sm leading-5 font-semibold text-white">
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
              <VouchCreationCartRow label="Stripe fee" value={formatCurrency(stripeFeeCents)} />
              <VouchCreationCartRow
                label="Due now"
                value={formatCurrency(totalDueNowCents)}
                strong
              />
            </div>
          </div>
          <p className="max-w-prose text-sm leading-6 font-semibold text-neutral-400">
            After the protocol fee is paid, the customer authorization checkout link becomes
            available on the Vouch detail page.
          </p>
        </div>
      ),
    },
  ]

  return (
    <main className="mb-16 grid gap-8 p-4 md:p-8 lg:p-12">
      {onboardingRequired ? (
        <OnboardingRequirementNotice action={openStripeConnectDashboard} />
      ) : null}
      <div className="grid gap-5">
        <VouchCreationWizard
          steps={steps}
          currentStep={currentStep}
          disabled={disabled}
          onStepChange={setCurrentStep}
          onComplete={submitVouch}
        />
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center border border-neutral-700 bg-black/80 px-4 py-3">
          <Image
            src="/Powered by Stripe - white.svg"
            alt="Powered by Stripe"
            width={150}
            height={34}
            className="h-auto w-32 opacity-90"
            priority={false}
          />
        </div>
      </div>
    </main>
  )
}
