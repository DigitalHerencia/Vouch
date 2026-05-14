"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FormEvent, ReactNode } from "react"
import { useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { createVouch } from "@/lib/actions/vouchActions"

type FieldErrors = Record<string, string[] | undefined>

const inputClass = "h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono text-white"

function dollarsToCents(value: string): number {
  const normalized = value.replace(/[$,\s]/g, "")
  const amount = Number(normalized)

  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100)
}

function firstError(fieldErrors: FieldErrors, field: string): string | null {
  return fieldErrors[field]?.[0] ?? null
}

export function CreateVouchForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false)
  const [amount, setAmount] = useState("")
  const [appointmentStartsAt, setAppointmentStartsAt] = useState("")
  const [confirmationOpensAt, setConfirmationOpensAt] = useState("")
  const [confirmationExpiresAt, setConfirmationExpiresAt] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const amountCents = useMemo(() => dollarsToCents(amount), [amount])
  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amountCents / 100),
    [amountCents]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await createVouch({
        amountCents,
        currency: "usd",
        appointmentStartsAt,
        confirmationOpensAt,
        confirmationExpiresAt,
        disclaimerAccepted: acceptedDisclaimer,
      })

      if (!result.ok) {
        setFormError(result.formError ?? "Vouch could not be created.")
        setFieldErrors(result.fieldErrors ?? {})
        return
      }

      if (result.data.checkoutUrl) {
        window.location.assign(result.data.checkoutUrl)
        return
      }

      router.push(result.data.detailPath)
    })
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_340px]" onSubmit={handleSubmit}>
      <section className="border border-neutral-800 bg-neutral-950/60">
        <Step number="1" title="Amount">
          <label className="text-sm text-neutral-200" htmlFor="vouch-amount">
            Amount (USD)
          </label>
          <Input
            id="vouch-amount"
            className={`mt-2 ${inputClass} text-lg`}
            inputMode="decimal"
            min="1"
            name="amount"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100.00"
            required
            type="text"
            value={amount}
          />
          <FieldError message={firstError(fieldErrors, "amountCents")} />
        </Step>

        <Step number="2" title="Appointment">
          <label className="text-sm text-neutral-200" htmlFor="appointment-starts-at">
            Appointment date and time
          </label>
          <Input
            id="appointment-starts-at"
            className={`mt-2 ${inputClass}`}
            name="appointmentStartsAt"
            onChange={(event) => setAppointmentStartsAt(event.target.value)}
            required
            type="datetime-local"
            value={appointmentStartsAt}
          />
          <FieldError message={firstError(fieldErrors, "appointmentStartsAt")} />
        </Step>

        <Step number="3" title="Confirmation window">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-neutral-200" htmlFor="confirmation-opens-at">
              Opens
              <Input
                id="confirmation-opens-at"
                className={`mt-2 ${inputClass}`}
                name="confirmationOpensAt"
                onChange={(event) => setConfirmationOpensAt(event.target.value)}
                required
                type="datetime-local"
                value={confirmationOpensAt}
              />
            </label>
            <label className="text-sm text-neutral-200" htmlFor="confirmation-expires-at">
              Expires
              <Input
                id="confirmation-expires-at"
                className={`mt-2 ${inputClass}`}
                name="confirmationExpiresAt"
                onChange={(event) => setConfirmationExpiresAt(event.target.value)}
                required
                type="datetime-local"
                value={confirmationExpiresAt}
              />
            </label>
          </div>
          <FieldError message={firstError(fieldErrors, "confirmationOpensAt")} />
          <FieldError message={firstError(fieldErrors, "confirmationExpiresAt")} />
        </Step>
      </section>

      <aside className="grid content-start gap-4">
        <div className="border border-neutral-800 bg-neutral-950/70 p-5">
          <h2 className="text-xl font-bold text-white">Summary</h2>
          <Line label="Vouch amount" value={amount ? amountLabel : "Enter amount"} />
          <Line label="Currency" value="USD" />
          <Line label="Merchant fee" value="Charged at creation" />
        </div>
        <label className="flex items-start gap-3 border border-neutral-800 bg-neutral-950/70 p-5">
          <Checkbox
            className="mt-1 rounded-none"
            checked={acceptedDisclaimer}
            onCheckedChange={(checked) => setAcceptedDisclaimer(checked === true)}
          />
          <span className="text-sm leading-6 text-neutral-300">
            I understand that funds release only if both parties confirm presence within the
            confirmation window. Otherwise the provider flow voids, refunds, or does not capture.
            Vouch does not mediate disputes or manually decide outcomes.
          </span>
        </label>
        <FieldError message={firstError(fieldErrors, "disclaimerAccepted")} />
        {formError ? (
          <p className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {formError}
          </p>
        ) : null}
        <Button
          className="h-12 disabled:opacity-40"
          disabled={isPending || !acceptedDisclaimer}
          type="submit"
        >
          {isPending ? "Creating" : "Create Vouch"}
          <ArrowRight className="ml-auto size-5" />
        </Button>
      </aside>
    </form>
  )
}

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-neutral-800 p-5 last:border-b-0">
      <h2 className="mb-4 flex items-center gap-4 font-bold text-white">
        <span className="font-mono text-primary">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null

  return <p className="mt-2 text-sm text-red-300">{message}</p>
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex justify-between gap-4 font-mono text-sm">
      <span className="text-neutral-300">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

export default CreateVouchForm
