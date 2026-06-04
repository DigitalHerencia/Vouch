import * as React from "react"
import { AlertCircle, Check, Clock, ReceiptText, ShieldCheck, WifiOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyStatePreset } from "@/components/ui/empty-state"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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

export type VouchCountdownProps = {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
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

export function DashboardEmptyState() {
  return (
    <EmptyStatePreset
      preset="no-data"
      variant="card"
      size="lg"
      customTitle="No Vouches yet"
      customDescription="Create a Vouch when you are ready to protect an appointment deposit. Your drafts, active Vouches, and completed purchases will appear here."
    />
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
  const current = step

  function goNext() {
    if (disabled) return
    if (current.canContinue === false) return
    if (currentStep < steps.length - 1) onStepChange(currentStep + 1)
    else onComplete?.()
  }

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16">
      {showProgress ? (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold tracking-wide uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-neutral-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      ) : null}

      <div
        className="mb-8 flex items-center justify-center gap-2"
        role="list"
        aria-label="Progress steps"
      >
        {steps.map((item, index) => (
          <React.Fragment key={item.id}>
            <button
              type="button"
              role="listitem"
              aria-label={`Step ${index + 1} of ${steps.length}: ${item.title}`}
              aria-current={index === currentStep ? "step" : undefined}
              onClick={() => onStepChange(index)}
              disabled={disabled}
              className={
                index <= currentStep
                  ? "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-blue-600 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  : "flex h-10 w-10 items-center justify-center border-3 border-neutral-400 bg-neutral-900 font-bold text-neutral-400 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </button>
            {index < steps.length - 1 ? (
              <div
                className={index < currentStep ? "h-1 w-8 bg-blue-600" : "h-1 w-8 bg-neutral-900"}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4 text-center">
          {step.icon ? (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-3 border-neutral-400 bg-black shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              {step.icon}
            </div>
          ) : null}
          <CardTitle className="text-6xl font-black uppercase">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {step.description ? (
            <CardDescription className="text-2xl font-black uppercase">
              {step.description}
            </CardDescription>
          ) : null}
          {step.content}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
              disabled={disabled || currentStep === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step.optional ? (
                <Button type="button" variant="ghost" onClick={goNext} disabled={disabled}>
                  Skip
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={goNext}
                disabled={disabled || step.canContinue === false}
              >
                {currentStep === steps.length - 1 ? (step.actionLabel ?? "Complete") : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function VouchCreationField({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string | undefined
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-xs font-black tracking-widest text-neutral-400 uppercase">
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm leading-5 font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}

export function VouchCreationCartRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-700 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-black tracking-widest text-neutral-400 uppercase">{label}</span>
      <span
        className={
          strong
            ? "font-mono text-sm font-black text-blue-600"
            : "font-mono text-sm font-black text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}

export const StatusBlocks = {
  Badge: VouchStatusBadge,
  Countdown: VouchCountdown,
  Timeline: VouchStatusTimeline,
  DashboardEmptyState,
  Full: VouchStatusDocument,
  VouchCreation: VouchCreationWizard,
  VouchCreationField,
  VouchCreationCartRow,
}
