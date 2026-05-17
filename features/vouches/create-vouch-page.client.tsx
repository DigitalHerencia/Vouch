"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { CreateVouchFieldGroup } from "@/components/forms/create-vouch-field-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { createVouch } from "@/lib/actions/vouchActions"
import { cn } from "@/lib/utils"
import { vouchPageCopy } from "@/content/vouches"

const draftFormSchema = z
  .object({
    amount: z.string().trim().min(1, "Enter the Vouch amount."),
    appointmentStartsAt: z.string().trim().min(1, "Enter the appointment date and time."),
    confirmationOpensAt: z.string().trim().min(1, "Enter when confirmation opens."),
    confirmationExpiresAt: z.string().trim().min(1, "Enter when confirmation closes."),
  })
  .superRefine((value, ctx) => {
    const amountCents = amountToCents(value.amount)
    if (!Number.isFinite(amountCents) || amountCents < 100) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must be at least $1.00.",
      })
    }

    const opens = new Date(value.confirmationOpensAt).getTime()
    const expires = new Date(value.confirmationExpiresAt).getTime()
    if (Number.isFinite(opens) && Number.isFinite(expires) && opens >= expires) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmationExpiresAt"],
        message: "Confirmation close must be after confirmation open.",
      })
    }
  })

const commitFormSchema = draftFormSchema.extend({
  disclaimerAccepted: z.boolean().refine((value) => value, {
    message: "You must accept the immutable Vouch and hosted Stripe fee terms.",
  }),
})

type DraftFormValues = z.infer<typeof draftFormSchema>
type CommitFormValues = z.infer<typeof commitFormSchema>

export type CreateVouchDraftValues = DraftFormValues

export function amountToCents(value: string): number {
  const normalized = value.replace(/[$,\s]/g, "")
  const amount = Number.parseFloat(normalized)
  return Math.round(amount * 100)
}

function toIsoFromLocalInput(value: string): string {
  return new Date(value).toISOString()
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function draftToSearchParams(values: DraftFormValues): URLSearchParams {
  const params = new URLSearchParams()
  params.set("amount", String(amountToCents(values.amount)))
  params.set("appointmentStartsAt", values.appointmentStartsAt)
  params.set("confirmationOpensAt", values.confirmationOpensAt)
  params.set("confirmationExpiresAt", values.confirmationExpiresAt)
  return params
}

export function CreateVouchDraftForm({ className }: { className?: string | undefined }) {
  const router = useRouter()
  const form = useForm<DraftFormValues>({
    resolver: zodResolver(draftFormSchema),
    defaultValues: {
      amount: "",
      appointmentStartsAt: "",
      confirmationOpensAt: "",
      confirmationExpiresAt: "",
    },
  })

  return (
    <Card className={cn("bg-black/80", className)}>
      <CardHeader>
        <CardTitle>{vouchPageCopy.create.detailsHeader}</CardTitle>
        <CardDescription>{vouchPageCopy.create.readyBody}</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit((values) => {
          router.push(`/vouches/new/confirm?${draftToSearchParams(values).toString()}`)
        })}
      >
        <CardContent className="grid gap-5">
          <CreateVouchFieldGroup
            id="amount"
            label="Amount"
            error={form.formState.errors.amount?.message}
          >
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="$250.00"
              {...form.register("amount")}
            />
          </CreateVouchFieldGroup>

          <CreateVouchFieldGroup
            id="appointmentStartsAt"
            label="Appointment date/time"
            error={form.formState.errors.appointmentStartsAt?.message}
          >
            <Input
              id="appointmentStartsAt"
              type="datetime-local"
              {...form.register("appointmentStartsAt")}
            />
          </CreateVouchFieldGroup>

          <div className="grid gap-5 sm:grid-cols-2">
            <CreateVouchFieldGroup
              id="confirmationOpensAt"
              label="Confirmation opens"
              error={form.formState.errors.confirmationOpensAt?.message}
            >
              <Input
                id="confirmationOpensAt"
                type="datetime-local"
                {...form.register("confirmationOpensAt")}
              />
            </CreateVouchFieldGroup>
            <CreateVouchFieldGroup
              id="confirmationExpiresAt"
              label="Confirmation closes"
              error={form.formState.errors.confirmationExpiresAt?.message}
            >
              <Input
                id="confirmationExpiresAt"
                type="datetime-local"
                {...form.register("confirmationExpiresAt")}
              />
            </CreateVouchFieldGroup>
          </div>

          <Alert>
            <AlertTitle>{vouchPageCopy.create.hostedPaymentTitle}</AlertTitle>
            <AlertDescription>{vouchPageCopy.create.hostedPaymentBody}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="cta" className="w-full justify-between">
            Review Vouch
            <ArrowRight className="size-5" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function ConfirmCreateVouchForm({
  draft,
  className,
}: {
  draft: CreateVouchDraftValues
  className?: string | undefined
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const form = useForm<CommitFormValues>({
    resolver: zodResolver(commitFormSchema),
    defaultValues: {
      ...draft,
      disclaimerAccepted: false,
    },
  })

  const amountCents = amountToCents(draft.amount)
  const feeEstimate = Math.max(Math.round(amountCents * 0.05), 500)

  return (
    <Card className={cn("bg-black/80", className)}>
      <CardHeader>
        <CardTitle>{vouchPageCopy.create.reviewTitle}</CardTitle>
        <CardDescription>{vouchPageCopy.create.reviewBody}</CardDescription>
      </CardHeader>
      <form
        id="confirm-create-vouch-form"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await createVouch({
              amountCents: amountToCents(values.amount),
              currency: "usd",
              appointmentStartsAt: toIsoFromLocalInput(values.appointmentStartsAt),
              confirmationOpensAt: toIsoFromLocalInput(values.confirmationOpensAt),
              confirmationExpiresAt: toIsoFromLocalInput(values.confirmationExpiresAt),
              disclaimerAccepted: values.disclaimerAccepted,
            })

            if (!result.ok) {
              form.setError("root", {
                message: result.formError ?? "Unable to create this Vouch.",
              })
              return
            }

            if (result.data.checkoutUrl) {
              window.location.assign(result.data.checkoutUrl)
              return
            }

            window.location.assign(result.data.detailPath)
          })
        })}
      >
        <CardContent className="grid gap-5">
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid border border-neutral-800 sm:grid-cols-2">
            <SummaryRow label="Vouch amount" value={formatCurrency(amountCents)} />
            <SummaryRow label="Estimated Vouch fee" value={formatCurrency(feeEstimate)} />
            <SummaryRow label="Appointment" value={draft.appointmentStartsAt.replace("T", " ")} />
            <SummaryRow
              label="Confirmation window"
              value={`${draft.confirmationOpensAt.replace("T", " ")} to ${draft.confirmationExpiresAt.replace("T", " ")}`}
            />
          </div>

          <Alert>
            <AlertTitle>{vouchPageCopy.create.feeTitle}</AlertTitle>
            <AlertDescription>{vouchPageCopy.create.feeBody}</AlertDescription>
          </Alert>

          <Alert>
            <AlertTitle>{vouchPageCopy.create.disclaimerLabel}</AlertTitle>
            <AlertDescription>
              Final confirmation is handled in a sheet with the required disclaimer acknowledgement
              before hosted Stripe checkout.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            size="cta"
            className="w-full justify-between"
            disabled={isPending}
            onClick={() => setConfirmationOpen(true)}
          >
            Review disclaimer
            <ArrowRight className="size-5" />
          </Button>
        </CardFooter>
        <Sheet open={confirmationOpen} onOpenChange={setConfirmationOpen}>
          <SheetContent className="border-l-2 border-neutral-100 bg-black text-white shadow-[6px_0_0_0_#1d4ed8]">
            <SheetHeader className="border-b-2 border-neutral-100 p-5">
              <SheetTitle className="font-(family-name:--font-display) text-4xl leading-none tracking-[0.04em] text-white uppercase">
                {vouchPageCopy.create.commitAction}
              </SheetTitle>
              <SheetDescription className="text-sm leading-6 font-bold text-neutral-400">
                Confirm the immutable Vouch terms before Vouch sends you to hosted Stripe checkout.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-5 p-5">
              <Controller
                control={form.control}
                name="disclaimerAccepted"
                render={({ field, fieldState }) => (
                  <Field>
                    <label className="flex items-start gap-3 border-2 border-neutral-100 bg-neutral-950 p-4">
                      <Checkbox
                        className="mt-1 rounded-none"
                        checked={field.value}
                        disabled={isPending}
                        aria-invalid={Boolean(fieldState.error)}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      <span>
                        <span className="font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-white uppercase">
                          {vouchPageCopy.create.disclaimerLabel}
                        </span>
                        <span className="mt-2 block text-xs leading-5 font-semibold text-neutral-400">
                          Sent Vouches are immutable. Customer payment authorization happens through
                          hosted Stripe checkout. Read the{" "}
                          <Link
                            href="/disclaimer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            disclaimer
                          </Link>
                          .
                        </span>
                      </span>
                    </label>
                    <FieldError
                      errors={
                        fieldState.error?.message
                          ? [{ message: fieldState.error.message }]
                          : undefined
                      }
                    />
                  </Field>
                )}
              />
            </div>
            <SheetFooter className="border-t-2 border-neutral-100 p-5">
              <Button
                type="submit"
                form="confirm-create-vouch-form"
                size="cta"
                className="w-full justify-between"
                disabled={isPending}
              >
                {isPending ? <LoaderCircle className="size-5 animate-spin" /> : null}
                {vouchPageCopy.create.commitAction}
                <ArrowRight className="size-5" />
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </Card>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-neutral-800 p-4 sm:border-r sm:[&:nth-child(2n)]:border-r-0">
      <p className="font-(family-name:--font-display) text-xs leading-none tracking-[0.08em] text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 font-bold text-neutral-100">{value}</p>
    </div>
  )
}
