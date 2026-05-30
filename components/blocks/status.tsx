import * as React from "react"
import {
  AlertCircle,
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

export interface VouchCountdownProps {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
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

export type VouchCreationDraft = {
  amountDollars: string
  appointmentStartsAt: string
  confirmationOpensAt: string
  confirmationExpiresAt: string
  disclaimerAccepted: boolean
}

export type VouchCreationPreviewData = {
  amountCents?: number
  customerTotalCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  detailPath?: string
  checkoutUrl?: string
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

export interface VouchCreationWizardContent {
  eyebrow: string
  title: string
  helper: string
  progressHint: string
  amountDescription: string
  cartTitle: string
  cartDescription: string
  immutableAcknowledgement: string
  steps: readonly { title: string; completeLabel: string; pendingLabel: string }[]
  protocolTiles: readonly { title: string; body: string }[]
  cartRail: readonly { label: string; value: string }[]
}

export interface VouchCreationWizardProps {
  content: VouchCreationWizardContent
  currentStep: number
  optimisticStep: number
  savedStepIndexes: readonly number[]
  draft: VouchCreationDraft
  preview?: VouchCreationPreviewData | undefined
  fieldErrors?: Record<string, string[]> | undefined
  formError?: string | null | undefined
  cartOpen: boolean
  isPending: boolean
  onDraftChange: (patch: Partial<VouchCreationDraft>) => void
  onStepSelect: (stepIndex: number) => void
  onBack: () => void
  onSaveAmount: () => void
  onSaveWindow: () => void
  onReviewCart: () => void
  onCartOpenChange: (open: boolean) => void
  onCreateVouch: () => void
}

const statusToneConfig: Record<
  VouchStatusTone,
  {
    badge: React.ComponentProps<typeof Badge>["variant"]
    icon: React.ElementType
  }
> = {
  active: { badge: "default", icon: Clock },
  pending: { badge: "secondary", icon: Clock },
  complete: { badge: "success", icon: Check },
  failed: { badge: "destructive", icon: AlertCircle },
  expired: { badge: "outline", icon: AlertCircle },
  offline: { badge: "warning", icon: WifiOff },
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

export function VouchCountdown({
  label,
  expiresAtLabel,
  remainingLabel,
  percentRemaining = 0,
  tone = "active",
}: VouchCountdownProps) {
  const clamped = Math.max(0, Math.min(100, percentRemaining))

  return (
    <div className="border-3 border-neutral-400 bg-black p-4 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
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

export function VouchCard({
  label,
  expiresAtLabel,
  remainingLabel,
  percentRemaining = 0,
  tone = "active",
}: VouchCountdownProps) {
  const clamped = Math.max(0, Math.min(100, percentRemaining))

  return (
    <div className="border-3 border-neutral-400 bg-black p-4 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
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

export function VouchStatusDocument({ data }: { data: VouchStatusDocumentData }) {
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
              <h2 className="mt-2 leading-none font-black tracking-wide uppercase">{data.title}</h2>
              <p className="mt-3 font-mono text-lg font-bold text-neutral-400 uppercase">
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
                <h3 className="font-black tracking-wide uppercase">Deterministic timeline</h3>
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

export function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-neutral-400 bg-black p-4">
      <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
      <p className="mt-2 truncate text-base font-black text-white uppercase">{value}</p>
    </div>
  )
}

export function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-700 pb-2 last:border-0 last:pb-0">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono font-black text-white">{value}</span>
    </div>
  )
}

export function VouchCreationWizard({
  content,
  currentStep,
  optimisticStep,
  savedStepIndexes,
  draft,
  preview,
  fieldErrors,
  formError,
  cartOpen,
  isPending,
  onDraftChange,
  onStepSelect,
  onBack,
  onSaveAmount,
  onSaveWindow,
  onReviewCart,
  onCartOpenChange,
  onCreateVouch,
}: VouchCreationWizardProps) {
  const progress = ((optimisticStep + 1) / content.steps.length) * 100
  const savedSteps = new Set(savedStepIndexes)
  const stepIcons = [CircleDollarSign, CalendarClock, FileCheck2] as const

  return (
    <div className="grid h-full min-h-0 w-full gap-4 overflow-hidden lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <aside className="flex min-h-0 flex-col border-3 border-neutral-400 bg-black">
        <div className="border-b-3 border-neutral-400 p-4 md:p-5">
          <p className="text-lg font-black tracking-widest text-blue-600 uppercase">
            {content.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl leading-none font-black tracking-wide uppercase md:text-4xl">
            {content.title}
          </h1>
        </div>

        <div className="grid flex-1 content-between gap-4 p-4 md:p-5">
          <div className="space-y-3">
            {content.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? FileCheck2
              const active = index === optimisticStep
              const complete = savedSteps.has(index)

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => onStepSelect(index)}
                  className={[
                    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-2 p-3 text-left transition",
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-[5px_5px_0_black]"
                      : "border-neutral-400 bg-black text-neutral-400 hover:border-blue-600",
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
                  <span className="font-mono text-xs font-black">
                    {complete ? step.completeLabel : step.pendingLabel}
                  </span>
                </button>
              )
            })}
          </div>

          <div>
            <Progress value={progress} className="h-3 shadow-none" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-neutral-400">
              <span>{Math.round(progress)}% complete</span>
              <span className="text-right">{content.progressHint}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-h-0 overflow-hidden border-3 border-neutral-400 bg-black">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="border-b-3 border-neutral-400 p-4 md:p-5">
            <h2 className="leading-none font-black tracking-wide uppercase">
              {content.steps[optimisticStep]?.title}
            </h2>
            <p className="mt-2 max-w-2xl text-lg leading-5 font-semibold text-neutral-400 md:text-sm">
              {content.helper}
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
                  description={content.amountDescription}
                  error={firstFieldError(fieldErrors, ["amountCents"])}
                >
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="5"
                    max="2500"
                    step="0.01"
                    value={draft.amountDollars}
                    onChange={(event) => onDraftChange({ amountDollars: event.target.value })}
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
                  <DateField
                    label="Appointment"
                    value={draft.appointmentStartsAt}
                    error={firstFieldError(fieldErrors, ["appointmentStartsAt"])}
                    onChange={(value) => onDraftChange({ appointmentStartsAt: value })}
                  />
                  <DateField
                    label="Opens"
                    value={draft.confirmationOpensAt}
                    error={firstFieldError(fieldErrors, ["confirmationOpensAt"])}
                    onChange={(value) => onDraftChange({ confirmationOpensAt: value })}
                  />
                  <DateField
                    label="Expires"
                    value={draft.confirmationExpiresAt}
                    error={firstFieldError(fieldErrors, ["confirmationExpiresAt"])}
                    onChange={(value) => onDraftChange({ confirmationExpiresAt: value })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {content.protocolTiles.map((tile, index) => (
                    <ProtocolTile
                      key={tile.title}
                      icon={index === 0 ? <Link2 /> : index === 1 ? <Database /> : <RefreshCw />}
                      title={tile.title}
                      body={tile.body}
                    />
                  ))}
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
                    onChange={(event) =>
                      onDraftChange({ disclaimerAccepted: event.target.checked })
                    }
                    className="mt-1 size-5 accent-blue-600"
                  />
                  <span className="text-sm leading-6 font-semibold text-neutral-400">
                    {content.immutableAcknowledgement}
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
              onClick={onBack}
              disabled={currentStep === 0 || isPending}
            >
              Back
            </Button>
            {currentStep === 0 ? (
              <Button type="button" disabled={isPending} onClick={onSaveAmount}>
                Save fee invoice
              </Button>
            ) : null}
            {currentStep === 1 ? (
              <Button type="button" disabled={isPending} onClick={onSaveWindow}>
                Save window
              </Button>
            ) : null}
            {currentStep === 2 ? (
              <Button
                type="button"
                disabled={isPending || !draft.disclaimerAccepted}
                onClick={onReviewCart}
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
        onOpenChange={onCartOpenChange}
        content={content}
        draft={draft}
        preview={preview}
        isPending={isPending}
        onConfirm={onCreateVouch}
      />
    </div>
  )
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
      <Label className="text-lg font-black tracking-widest text-neutral-400 uppercase">
        {label}
      </Label>
      {children}
      {description ? (
        <p className="text-lg leading-tight font-semibold text-neutral-400">{description}</p>
      ) : null}
      {error ? <p className="text-lg leading-tight font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

function DateField({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error: string | null
  onChange: (value: string) => void
}) {
  return (
    <FieldShell label={label} error={error}>
      <Input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-none border border-neutral-400 bg-black px-3 text-sm font-bold text-white focus-visible:border-blue-600 focus-visible:ring-0"
      />
    </FieldShell>
  )
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
        {icon}
      </div>
      <p className="text-sm font-black uppercase">{title}</p>
      <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">{body}</p>
    </div>
  )
}

function VouchCreationCartSheet({
  open,
  onOpenChange,
  content,
  draft,
  preview,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: VouchCreationWizardContent
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
            {content.cartTitle}
          </SheetTitle>
          <SheetDescription className="font-semibold">{content.cartDescription}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 overflow-auto p-5">
          <div className="grid gap-5">
            <section className="grid gap-3 border-3 border-neutral-400 bg-black p-4">
              <StatusRow label="Protected amount" value={formatCurrency(protectedAmount)} />
              <StatusRow label="Vouch fee" value={formatCurrency(vouchFee)} />
              <StatusRow label="Processing offset" value={formatCurrency(processingOffset)} />
              <StatusRow label="Fee invoice due now" value={formatCurrency(feeInvoiceTotal)} />
            </section>
            <section className="grid gap-3 border-3 border-neutral-400 bg-neutral-900 p-4">
              <p className="text-sm font-black text-white uppercase">Create sequence</p>
              {content.cartRail.map((item) => (
                <div key={item.label} className="border border-neutral-400 bg-black p-3">
                  <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>
          </div>
        </div>
        <SheetFooter className="gap-3 border-t-3 border-neutral-400 p-5 sm:space-x-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Back to wizard
          </Button>
          <Button type="button" disabled={isPending} onClick={onConfirm}>
            Open hosted fee invoice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function firstFieldError(fieldErrors: Record<string, string[]> | undefined, fields: string[]) {
  for (const field of fields) {
    const message = fieldErrors?.[field]?.[0]
    if (message) return message
  }

  return null
}

function dollarsFromCents(cents?: number) {
  if (!Number.isFinite(cents)) return "$0.00"

  return formatCurrency((cents ?? 0) / 100)
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

export const StatusBlocks = {
  Badge: VouchStatusBadge,
  Countdown: VouchCountdown,
  Timeline: VouchStatusTimeline,
  Full: VouchStatusDocument,
  VouchCreation: VouchCreationWizard,
}
