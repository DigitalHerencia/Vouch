"use client"

import * as React from "react"
import { CalendarClock, CircleDollarSign, FileCheck2, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { OnboardingWizard } from "@/components/blocks/onboarding-flow"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createVouch } from "@/lib/actions/vouchActions"

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

function parseAmountCents(value: string) {
  const amount = Number(value.trim().replace(/[$,\s]/g, ""))
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

function toIsoFromLocalDateTime(value: string) {
  if (!value) return ""

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function formatDateTime(value: string) {
  if (!value) return "Select an appointment"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Select an appointment"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function VouchForm() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [draft, setDraft] = React.useState<CreateVouchDraft>(defaultDraft)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]> | undefined>()
  const [isPending, startTransition] = React.useTransition()

  const amountCents = parseAmountCents(draft.amountDollars)
  const protocolFeeCents = calculateProtocolFeeCents(amountCents)
  const stripeFeeCents = calculateStripeFeeCents(protocolFeeCents)
  const totalDueNowCents = protocolFeeCents + stripeFeeCents
  const appointmentIso = toIsoFromLocalDateTime(draft.appointmentStartsAt)

  const canContinueDisclaimer = draft.disclaimerAccepted
  const canContinueAppointment = Boolean(appointmentIso) && amountCents > 0

  function updateDraft(patch: Partial<CreateVouchDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setFormError(null)
    setFieldErrors(undefined)
  }

  function submitVouch() {
    startTransition(async () => {
      setFormError(null)
      setFieldErrors(undefined)

      const result = await createVouch({
        amountCents,
        currency: "usd",
        appointmentStartsAt: appointmentIso,
        disclaimerAccepted: draft.disclaimerAccepted,
      })

      if (!result.ok) {
        setFormError(result.formError ?? "Unable to create this Vouch.")
        setFieldErrors(result.fieldErrors)
        return
      }

      window.location.assign(result.data.checkoutUrl ?? result.data.detailPath)
    })
  }

  const steps = [
    {
      id: "disclaimer",
      title: "Disclaimer",
      icon: <FileCheck2 className="h-8 w-8 text-white" />,
      canContinue: canContinueDisclaimer,
      content: (
        <div className="grid gap-3 bg-black">
          <label className="flex items-center gap-3 bg-black p-1">
            <Checkbox
              checked={draft.disclaimerAccepted}
              onCheckedChange={(checked) => updateDraft({ disclaimerAccepted: checked === true })}
              className="mt-1 border-neutral-400"
            />
            <span className="text-sm leading-6 font-bold text-neutral-300">
              I agree to the
              <Button asChild variant="nav" size="nav" className="ml-3">
                <Link href="/legal/disclaimer" target="_blank" rel="noreferrer">
                  Disclaimer
                </Link>
              </Button>
              .
            </span>
          </label>
          {fieldErrors?.disclaimerAccepted?.[0] ? (
            <p className="text-sm font-semibold text-red-600">
              {fieldErrors.disclaimerAccepted[0]}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "appointment",
      title: "Appointment",
      description: "Date, time, and amount step",
      icon: <CalendarClock className="h-8 w-8 text-white" />,
      canContinue: canContinueAppointment,
      content: (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell
              label="Appointment date and time"
              error={fieldErrors?.appointmentStartsAt?.[0]}
            >
              <Input
                type="datetime-local"
                value={draft.appointmentStartsAt}
                onChange={(event) => updateDraft({ appointmentStartsAt: event.target.value })}
                className="h-12 rounded-none border-2 border-neutral-400 bg-black font-mono font-bold text-white"
              />
            </FieldShell>
            <FieldShell label="Amount" error={fieldErrors?.amountCents?.[0]}>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="250.00"
                value={draft.amountDollars}
                onChange={(event) => updateDraft({ amountDollars: event.target.value })}
                className="h-12 rounded-none border-2 border-neutral-400 bg-black font-mono font-bold text-white"
              />
            </FieldShell>
          </div>
          <div className="bg-black text-base leading-7 font-semibold text-neutral-300">
            Create your Vouch up to 24 hours in advance. After the appointment, you and your
            customer can confirm it took place within 1 hour before or after the appointment time
            you choose.
          </div>
        </div>
      ),
    },
    {
      id: "cart",
      title: "Review",
      icon: <CircleDollarSign className="h-8 w-8 text-white" />,
      canContinue: !isPending,
      actionLabel: isPending ? "Opening Checkout" : "Pay protocol fee",
      content: (
        <div className="grid gap-4">
          {formError ? (
            <div className="border border-red-600 bg-red-600/10 p-3 text-sm font-semibold text-white">
              {formError}
            </div>
          ) : null}
          <div className="bg-black p-1">
            <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-neutral-400 pb-3">
              <div>
                <p className="text-xs font-black tracking-widest text-blue-600 uppercase">
                  Review your
                </p>
                <p className="mt-1 text-lg font-black uppercase">Vouch details</p>
              </div>
              <ShieldCheck className="size-6 text-white" />
            </div>
            <div className="grid gap-3">
              <CartRow label="Appointment" value={formatDateTime(draft.appointmentStartsAt)} />
              <CartRow label="Amount" value={formatCurrency(amountCents)} />
              <CartRow
                label="Protocol fee"
                value={`${formatCurrency(protocolFeeCents)} (5% min $5)`}
              />
              <CartRow label="Stripe fee" value={formatCurrency(stripeFeeCents)} />
              <CartRow label="Due now" value={formatCurrency(totalDueNowCents)} strong />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <main className="mb-16 p-4 md:p-8 lg:p-12">
      <OnboardingWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onComplete={submitVouch}
      />
    </main>
  )
}

function FieldShell({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string | undefined
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-black tracking-widest text-neutral-400 uppercase">
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

function CartRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-700 pb-2 last:border-0 last:pb-0">
      <span className="text-sm font-bold text-neutral-400 uppercase">{label}</span>
      <span
        className={
          strong ? "font-mono font-black text-blue-600" : "font-mono font-black text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}
