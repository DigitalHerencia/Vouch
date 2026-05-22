"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock,
  Database,
  FileCheck2,
  Link2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  WifiOff,
} from "lucide-react"

import { Receipt } from "@/components/blocks/invoice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyStatePreset } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Timeline,
  TimelineCard,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

export type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"

export type VouchStatusStepState = "completed" | "current" | "upcoming"

export interface VouchStatusTimelineItem {
  id: string
  title: string
  description: string
  timeLabel?: string
  state: VouchStatusStepState
  meta?: string
}

export interface VouchStatusDocumentData {
  title: string
  publicId: string
  status: string
  statusTone?: VouchStatusTone
  amountLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  confirmationOpensLabel: string
  confirmationExpiresLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  countdown?: VouchCountdownProps
  timeline: VouchStatusTimelineItem[]
  confirmations: {
    merchantConfirmed: boolean
    customerConfirmed: boolean
    action?: React.ReactNode
  }
  audit?: Array<{ label: string; value: string }>
}

export interface VouchStatusDocumentProps {
  data: VouchStatusDocumentData
}

const statusToneConfig: Record<
  VouchStatusTone,
  {
    badge: React.ComponentProps<typeof Badge>["variant"]
    className: string
    icon: React.ElementType
  }
> = {
  active: { badge: "default", className: "border-blue-600 bg-blue-600 text-white", icon: Clock },
  pending: {
    badge: "secondary",
    className: "border-neutral-400 bg-neutral-900 text-white",
    icon: Clock,
  },
  complete: { badge: "success", className: "border-blue-600 bg-blue-600 text-white", icon: Check },
  failed: {
    badge: "destructive",
    className: "border-red-600 bg-red-600 text-white",
    icon: AlertCircle,
  },
  expired: {
    badge: "outline",
    className: "border-neutral-400 bg-black text-neutral-300",
    icon: AlertCircle,
  },
  offline: { badge: "warning", className: "border-blue-600 bg-blue-600 text-white", icon: WifiOff },
}

export function VouchStatusBadge({
  status,
  tone = "pending",
  className,
}: {
  status: string
  tone?: VouchStatusTone
  className?: string
}) {
  const config = statusToneConfig[tone]
  const Icon = config.icon

  return (
    <Badge variant={config.badge} className={className}>
      <Icon className="mr-1.5 size-3.5" />
      {status}
    </Badge>
  )
}

export interface VouchCountdownProps {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
}

export function VouchCountdown({
  label,
  expiresAtLabel,
  remainingLabel,
  percentRemaining = 0,
  tone = "active",
}: VouchCountdownProps) {
  const clamped = Math.max(0, Math.min(100, percentRemaining))

  return (
    <div className="border-3 border-neutral-400 bg-black p-4 shadow-[6px_6px_0px_oklch(54.6%_0.245_262.881)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
          <p className="mt-2 font-mono text-3xl leading-none font-black text-white uppercase">
            {remainingLabel}
          </p>
        </div>
        <VouchStatusBadge status={tone} tone={tone} />
      </div>
      <Progress value={clamped} className="h-4 shadow-none" />
      <p className="mt-3 text-xs leading-5 font-bold text-neutral-400 uppercase">
        Expires {expiresAtLabel}
      </p>
    </div>
  )
}

export function VouchStatusTimeline({ items }: { items: VouchStatusTimelineItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyStatePreset
        preset="no-data"
        variant="card"
        customTitle="No status events"
        customDescription="Provider, webhook, and confirmation events will appear here when the server records them."
      />
    )
  }

  return (
    <Timeline className="gap-0">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TimelineItem status={item.state}>
            <TimelineDot status={item.state} size="lg">
              {item.state === "completed" ? (
                <Check className="size-5 text-white" />
              ) : (
                <span className="font-mono text-xs font-black text-white">{index + 1}</span>
              )}
            </TimelineDot>
            <TimelineContent>
              <TimelineCard className={item.state === "current" ? "border-blue-600" : undefined}>
                <TimelineHeader className="justify-between">
                  <TimelineTitle>{item.title}</TimelineTitle>
                  {item.timeLabel ? <TimelineTime>{item.timeLabel}</TimelineTime> : null}
                </TimelineHeader>
                <TimelineDescription>{item.description}</TimelineDescription>
                {item.meta ? (
                  <p className="mt-3 border border-neutral-400 bg-neutral-900 p-2 font-mono text-[11px] font-bold text-neutral-300 uppercase">
                    {item.meta}
                  </p>
                ) : null}
              </TimelineCard>
            </TimelineContent>
          </TimelineItem>
          {index < items.length - 1 ? <TimelineConnector status={item.state} /> : null}
        </React.Fragment>
      ))}
    </Timeline>
  )
}

export function VouchStatusDocument({ data }: VouchStatusDocumentProps) {
  const tone = data.statusTone ?? "pending"

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className="grid gap-6 p-5 md:p-8">
          <header className="grid gap-5 border-b-3 border-neutral-400 pb-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                Vouch status
              </p>
              <h2 className="mt-2 text-3xl leading-none font-black tracking-wide uppercase md:text-5xl">
                {data.title}
              </h2>
              <p className="mt-3 font-mono text-xs font-bold text-neutral-400 uppercase">
                {data.publicId}
              </p>
            </div>
            <div className="grid content-start gap-3 text-left md:text-right">
              <VouchStatusBadge status={data.status} tone={tone} className="justify-center" />
              <p className="font-mono text-3xl font-black text-white">{data.amountLabel}</p>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatusTile label="Merchant" value={data.merchantLabel} />
            <StatusTile label="Customer" value={data.customerLabel} />
            <StatusTile label="Window closes" value={data.confirmationExpiresLabel} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              {data.countdown ? <VouchCountdown {...data.countdown} /> : null}
              <ConfirmationProtocolCard {...data.confirmations} />
              <section className="border-3 border-neutral-400 bg-neutral-900 p-4">
                <p className="mb-3 text-xs font-black tracking-widest text-blue-600 uppercase">
                  Payment invoice
                </p>
                <div className="grid gap-3 text-sm">
                  <StatusRow label="Customer authorizes" value={data.customerTotalLabel} />
                  <StatusRow label="Merchant receives" value={data.merchantReceivesLabel} />
                  <StatusRow label="PaymentIntent" value={data.paymentStatusLabel} />
                  <StatusRow label="Settlement" value={data.settlementStatusLabel} />
                </div>
              </section>
            </div>

            <section className="border-3 border-neutral-400 bg-black p-4">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-neutral-400 pb-3">
                <h3 className="text-xl font-black tracking-wide uppercase">
                  Deterministic timeline
                </h3>
                <ReceiptText className="size-5 text-blue-600" />
              </div>
              <VouchStatusTimeline items={data.timeline} />
            </section>
          </section>

          {data.audit?.length ? (
            <section className="grid gap-3 border-t-3 border-neutral-400 pt-6 md:grid-cols-2">
              {data.audit.map((item) => (
                <StatusTile key={item.label} label={item.label} value={item.value} />
              ))}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ConfirmationProtocolCard({
  merchantConfirmed,
  customerConfirmed,
  action,
}: VouchStatusDocumentData["confirmations"]) {
  return (
    <section className="border-3 border-neutral-400 bg-black p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black tracking-wide uppercase">Presence confirmation</h3>
        <ShieldCheck className="size-5 text-blue-600" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConfirmStateTile label="Merchant" confirmed={merchantConfirmed} />
        <ConfirmStateTile label="Customer" confirmed={customerConfirmed} />
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}

function ConfirmStateTile({ label, confirmed }: { label: string; confirmed: boolean }) {
  return (
    <div className="border border-neutral-400 bg-neutral-900 p-3">
      <p className="text-[11px] font-black tracking-widest text-neutral-400 uppercase">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-black uppercase">
        {confirmed ? <Check className="size-4 text-blue-600" /> : <Clock className="size-4" />}
        {confirmed ? "Confirmed" : "Waiting"}
      </p>
    </div>
  )
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-neutral-400 bg-black p-4">
      <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
      <p className="mt-2 truncate text-base font-black text-white uppercase">{value}</p>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-700 pb-2 last:border-0 last:pb-0">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono font-black text-white">{value}</span>
    </div>
  )
}

export type VouchCreationDraft = {
  amountDollars: string
  appointmentStartsAt: string
  confirmationOpensAt: string
  confirmationExpiresAt: string
  disclaimerAccepted: boolean
}

export type VouchCreationActionResult =
  | {
      ok: true
      data?: VouchCreationPreviewData
    }
  | {
      ok: false
      formError?: string
      fieldErrors?: Record<string, string[]>
    }

export type VouchCreationPreviewData = {
  amountCents?: number
  customerTotalCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  detailPath?: string
  checkoutUrl?: string
}

export interface VouchCreationWizardProps {
  initialDraft?: Partial<VouchCreationDraft> | undefined
  onSaveAmount: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onSaveWindow: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
  onCreateVouch: (draft: VouchCreationDraft) => Promise<VouchCreationActionResult>
}

const defaultVouchDraft: VouchCreationDraft = {
  amountDollars: "50.00",
  appointmentStartsAt: "",
  confirmationOpensAt: "",
  confirmationExpiresAt: "",
  disclaimerAccepted: false,
}

function dollarsFromCents(cents?: number): string {
  if (!Number.isFinite(cents)) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100)
}

function firstFieldError(
  fieldErrors: Record<string, string[]> | undefined,
  fields: string[]
): string | null {
  for (const field of fields) {
    const message = fieldErrors?.[field]?.[0]
    if (message) return message
  }

  return null
}

function FieldShell({
  label,
  children,
  description,
  error,
}: {
  label: string
  children: React.ReactNode
  description?: string | undefined
  error?: string | null | undefined
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-[11px] font-black tracking-widest text-neutral-300 uppercase">
        {label}
      </Label>
      {children}
      {description ? (
        <p className="text-[12px] leading-5 font-semibold text-neutral-400">{description}</p>
      ) : null}
      {error ? <p className="text-[12px] leading-5 font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

export function VouchCreationWizard({
  initialDraft,
  onSaveAmount,
  onSaveWindow,
  onCreateVouch,
}: VouchCreationWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [draft, setDraft] = React.useState<VouchCreationDraft>({
    ...defaultVouchDraft,
    ...initialDraft,
  })
  const [savedSteps, setSavedSteps] = React.useState<Set<number>>(() => new Set())
  const [result, setResult] = React.useState<VouchCreationActionResult | null>(null)
  const [cartOpen, setCartOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [optimisticStep, setOptimisticStep] = React.useOptimistic(currentStep)
  const progress = ((optimisticStep + 1) / 3) * 100

  const fieldErrors = result?.ok === false ? result.fieldErrors : undefined
  const formError = result?.ok === false ? result.formError : null
  const preview = result?.ok ? result.data : undefined
  const steps = [
    { title: "Fee invoice", icon: CircleDollarSign },
    { title: "Paylink window", icon: CalendarClock },
    { title: "Immutable create", icon: FileCheck2 },
  ] as const

  function updateDraft(patch: Partial<VouchCreationDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setResult(null)
  }

  function markSaved(stepIndex: number) {
    setSavedSteps((current) => {
      const next = new Set(current)
      next.add(stepIndex)
      return next
    })
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
      } else if (nextResult.data?.checkoutUrl) {
        window.location.href = nextResult.data.checkoutUrl
      } else if (nextResult.data?.detailPath) {
        window.location.href = nextResult.data.detailPath
      }
    })
  }

  function openCart() {
    setResult(null)
    setCartOpen(true)
  }

  function goBack() {
    const nextStep = Math.max(currentStep - 1, 0)
    setOptimisticStep(nextStep)
    setCurrentStep(nextStep)
    setResult(null)
  }

  return (
    <div className="grid h-full min-h-0 w-full gap-4 overflow-hidden lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <aside className="flex min-h-0 flex-col border-3 border-neutral-400 bg-black">
        <div className="border-b-3 border-neutral-400 p-4 md:p-5">
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            New Vouch
          </p>
          <h1 className="mt-2 text-2xl leading-none font-black tracking-wide uppercase md:text-4xl">
            Create status rail
          </h1>
        </div>

        <div className="grid flex-1 content-between gap-4 p-4 md:p-5">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const active = index === optimisticStep
              const complete = savedSteps.has(index)

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => {
                    if (index <= currentStep || savedSteps.has(index - 1)) {
                      setOptimisticStep(index)
                      setCurrentStep(index)
                      setResult(null)
                    }
                  }}
                  className={[
                    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-2 p-3 text-left transition",
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-[5px_5px_0_#000]"
                      : "border-neutral-400 bg-black text-neutral-300 hover:border-blue-600",
                  ].join(" ")}
                >
                  <span className="flex size-10 items-center justify-center border border-neutral-400 bg-black text-white">
                    {complete ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black tracking-widest uppercase">
                      Step {index + 1}
                    </span>
                    <span className="block truncate text-sm font-black uppercase">
                      {step.title}
                    </span>
                  </span>
                  <span className="font-mono text-xs font-black">{complete ? "OK" : "..."}</span>
                </button>
              )
            })}
          </div>

          <div>
            <Progress value={progress} className="h-3 shadow-none" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-neutral-400">
              <span>{Math.round(progress)}% complete</span>
              <span className="text-right">Server state owns outcome</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-h-0 overflow-hidden border-3 border-neutral-400 bg-black">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="border-b-3 border-neutral-400 p-4 md:p-5">
            <h2 className="text-xl leading-none font-black tracking-wide uppercase md:text-3xl">
              {steps[optimisticStep]?.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[12px] leading-5 font-semibold text-neutral-400 md:text-sm">
              UI only: fee math, immutable creation, provider links, idempotency keys, retries, and
              webhook reconciliation stay on the server.
            </p>
          </div>

          <div className="min-h-0 overflow-auto p-4 md:p-5">
            {formError ? (
              <div className="mb-4 border border-red-600 bg-red-600/10 p-3 text-sm font-semibold text-white">
                {formError}
              </div>
            ) : null}

            {optimisticStep === 0 ? (
              <div className="grid h-full min-h-0 content-center gap-4">
                <FieldShell
                  label="Protected amount"
                  description="The application fee and provider fee preview are calculated server-side before the Vouch can be created."
                  error={firstFieldError(fieldErrors, ["amountCents"])}
                >
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="5"
                    max="2500"
                    step="0.01"
                    value={draft.amountDollars}
                    onChange={(event) => updateDraft({ amountDollars: event.target.value })}
                    className="h-14 rounded-none border border-neutral-400 bg-black px-4 text-xl font-black text-white focus-visible:border-blue-600 focus-visible:ring-0"
                  />
                </FieldShell>

                <div className="grid gap-3 sm:grid-cols-3">
                  <StatusTile label="Protected" value={dollarsFromCents(preview?.amountCents)} />
                  <StatusTile
                    label="Vouch fee"
                    value={dollarsFromCents(preview?.vouchServiceFeeCents)}
                  />
                  <StatusTile
                    label="Processing offset"
                    value={dollarsFromCents(preview?.processingFeeOffsetCents)}
                  />
                </div>
              </div>
            ) : null}

            {optimisticStep === 1 ? (
              <div className="grid h-full min-h-0 content-center gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FieldShell
                    label="Appointment"
                    error={firstFieldError(fieldErrors, ["appointmentStartsAt"])}
                  >
                    <Input
                      type="datetime-local"
                      value={draft.appointmentStartsAt}
                      onChange={(event) => updateDraft({ appointmentStartsAt: event.target.value })}
                      className="h-12 rounded-none border border-neutral-400 bg-black px-3 text-sm font-bold text-white focus-visible:border-blue-600 focus-visible:ring-0"
                    />
                  </FieldShell>
                  <FieldShell
                    label="Opens"
                    error={firstFieldError(fieldErrors, ["confirmationOpensAt"])}
                  >
                    <Input
                      type="datetime-local"
                      value={draft.confirmationOpensAt}
                      onChange={(event) => updateDraft({ confirmationOpensAt: event.target.value })}
                      className="h-12 rounded-none border border-neutral-400 bg-black px-3 text-sm font-bold text-white focus-visible:border-blue-600 focus-visible:ring-0"
                    />
                  </FieldShell>
                  <FieldShell
                    label="Expires"
                    error={firstFieldError(fieldErrors, ["confirmationExpiresAt"])}
                  >
                    <Input
                      type="datetime-local"
                      value={draft.confirmationExpiresAt}
                      onChange={(event) =>
                        updateDraft({ confirmationExpiresAt: event.target.value })
                      }
                      className="h-12 rounded-none border border-neutral-400 bg-black px-3 text-sm font-bold text-white focus-visible:border-blue-600 focus-visible:ring-0"
                    />
                  </FieldShell>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <ProtocolTile
                    icon={<Link2 />}
                    title="Paylink"
                    body="Merchant receives the hosted payment link after fee payment and immutable create."
                  />
                  <ProtocolTile
                    icon={<Database />}
                    title="Idempotent DB"
                    body="The feature layer should write transactionally with retry-aware idempotency keys."
                  />
                  <ProtocolTile
                    icon={<RefreshCw />}
                    title="Webhook sync"
                    body="Stripe events reconcile payment, authorization, capture, expiration, and refund state."
                  />
                </div>
              </div>
            ) : null}

            {optimisticStep === 2 ? (
              <div className="grid h-full min-h-0 content-center gap-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <StatusTile
                    label="Amount"
                    value={draft.amountDollars ? `$${draft.amountDollars}` : "$0.00"}
                  />
                  <StatusTile label="Currency" value="USD" />
                  <StatusTile label="Outcome" value="State decides" />
                </div>

                <label className="flex min-w-0 items-start gap-3 border border-neutral-400 p-4">
                  <input
                    type="checkbox"
                    checked={draft.disclaimerAccepted}
                    onChange={(event) => updateDraft({ disclaimerAccepted: event.target.checked })}
                    className="mt-1 size-5 accent-blue-600"
                  />
                  <span className="text-sm leading-6 font-semibold text-neutral-300">
                    I understand this Vouch becomes immutable after creation data is issued. Funds
                    release only when merchant and customer confirmations are both recorded inside
                    the confirmation window.
                  </span>
                </label>
                {firstFieldError(fieldErrors, ["disclaimerAccepted"]) ? (
                  <p className="text-sm font-semibold text-red-600">
                    {firstFieldError(fieldErrors, ["disclaimerAccepted"])}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t-3 border-neutral-400 p-4 md:p-5">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 0 || isPending}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {currentStep === 0 ? (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => runStep(() => onSaveAmount(draft), 1)}
              >
                Save fee invoice
                <ArrowRight className="size-4" />
              </Button>
            ) : null}

            {currentStep === 1 ? (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => runStep(() => onSaveWindow(draft), 2)}
              >
                Save window
                <ArrowRight className="size-4" />
              </Button>
            ) : null}

            {currentStep === 2 ? (
              <Button
                type="button"
                disabled={isPending || !draft.disclaimerAccepted}
                onClick={openCart}
              >
                Review cart
                <ShoppingCart className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <VouchCreationCartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        draft={draft}
        preview={preview}
        isPending={isPending}
        onConfirm={() => runStep(() => onCreateVouch(draft))}
      />
    </div>
  )
}

function VouchCreationCartSheet({
  open,
  onOpenChange,
  draft,
  preview,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: VouchCreationDraft
  preview?: VouchCreationPreviewData | undefined
  isPending: boolean
  onConfirm: () => void
}) {
  const protectedAmount = parseCurrencyLabel(draft.amountDollars)
  const vouchFee = (preview?.vouchServiceFeeCents ?? 0) / 100
  const processingOffset = (preview?.processingFeeOffsetCents ?? 0) / 100
  const feeInvoiceTotal = vouchFee + processingOffset

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="grid h-full w-[92vw] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b-3 border-neutral-400 p-5 pr-14 text-left">
          <SheetTitle className="text-2xl font-black tracking-wide uppercase">
            Vouch cart
          </SheetTitle>
          <SheetDescription className="font-semibold">
            Confirm the server-owned create request, then continue to the hosted fee invoice.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 overflow-auto p-5">
          <div className="grid gap-5">
            <Receipt
              data={{
                receiptNumber: "VOUCH-CREATE",
                date: "Issued on create",
                merchant: {
                  name: "Vouch application fee",
                  address: "Hosted Stripe invoice",
                },
                items: [
                  {
                    name: "Vouch service fee",
                    price: vouchFee,
                  },
                  {
                    name: "Stripe fee offset",
                    price: processingOffset,
                  },
                ],
                subtotal: feeInvoiceTotal,
                total: feeInvoiceTotal,
                paymentMethod: "Stripe hosted invoice",
              }}
            />

            <section className="grid gap-3 border-3 border-neutral-400 bg-neutral-900 p-4">
              <p className="text-sm font-black text-white uppercase">Create sequence</p>
              <CartRailItem
                label="1. Idempotent create"
                value="Feature server action writes Vouch state transactionally with retry-safe keys."
              />
              <CartRailItem
                label="2. Fee invoice"
                value="Merchant pays application fee and Stripe fee through a hosted one-time invoice."
              />
              <CartRailItem
                label="3. Immutable paylink"
                value="After paid webhook reconciliation, the destination PaymentIntent link is issued and the Vouch becomes immutable."
              />
              <CartRailItem
                label="4. Bilateral confirmation"
                value="Merchant and customer DB writes inside the window determine capture; otherwise the intent expires or is voided."
              />
            </section>

            <section className="grid gap-3 border-3 border-neutral-400 bg-black p-4">
              <StatusRow label="Protected amount" value={formatCurrency(protectedAmount)} />
              <StatusRow label="Fee invoice due now" value={formatCurrency(feeInvoiceTotal)} />
              <StatusRow
                label="Confirmation opens"
                value={draft.confirmationOpensAt || "Not set"}
              />
              <StatusRow
                label="Confirmation expires"
                value={draft.confirmationExpiresAt || "Not set"}
              />
            </section>
          </div>
        </div>

        <SheetFooter className="gap-3 border-t-3 border-neutral-400 p-5 sm:space-x-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Back to wizard
          </Button>
          <Button type="button" disabled={isPending} onClick={onConfirm}>
            Open hosted fee invoice
            <ArrowRight className="size-4" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function CartRailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-400 bg-black p-3">
      <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
      <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">{value}</p>
    </div>
  )
}

function parseCurrencyLabel(value: string) {
  const amount = Number(value.trim().replace(/[$,\s]/g, ""))

  return Number.isFinite(amount) ? amount : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function ProtocolTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="border border-neutral-400 bg-neutral-900 p-4">
      <div className="mb-3 flex size-10 items-center justify-center border border-neutral-400 bg-black text-blue-600">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
              className: "size-5",
            })
          : icon}
      </div>
      <p className="text-sm font-black uppercase">{title}</p>
      <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">{body}</p>
    </div>
  )
}

export const StatusBlocks = {
  Badge: VouchStatusBadge,
  Countdown: VouchCountdown,
  Timeline: VouchStatusTimeline,
  Full: VouchStatusDocument,
  VouchCreation: VouchCreationWizard,
}
