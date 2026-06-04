import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { AuthorizationCheckoutCard } from "@/components/vouches/authorization-checkout-card"
import { VouchCountdown } from "@/components/vouches/vouch-countdown"
import { VouchStatusDocument } from "@/components/vouches/vouch-status-document"
import { VouchStatusTimeline } from "@/components/vouches/vouch-status-timeline"
import { vouchPageCopy } from "@/content/vouches"
import { ConfirmPresenceInlineForm } from "@/features/vouches/vouchDetailFeature.client"
import { confirmPresenceFormAction } from "@/lib/actions/vouchActions"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import {
  getAuditTimeline,
  getConfirmPresencePageState,
  getVouchDetailForParticipant,
} from "@/lib/fetchers/vouchFetchers"

type VouchDetailPageProps = {
  vouchId: string
}

type ConfirmationState = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
  canConfirm: boolean
  action: ReactNode
}

type VouchDetailViewProps = {
  title: string
  amountLabel: string
  statusLabel: string
  currentUserRoleLabel: string
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  authorizationCheckoutUrl: string | null
  confirmation: ConfirmationState
  timeline: Array<{ label: string; timestampLabel: string }>
}

type VouchStatusTimelineItem = {
  id: string
  title: string
  description: string
  state: "completed" | "current" | "upcoming"
  timeLabel?: string
  meta?: string
}

const money = (cents: unknown, currency: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency ?? "usd").toUpperCase(),
  }).format(Number(cents ?? 0) / 100)

const dateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not set"

const participantName = (
  participant: { displayName: string | null; email: string | null } | null
) => participant?.displayName ?? participant?.email ?? "Pending"

export async function VouchDetailPage({ vouchId }: VouchDetailPageProps) {
  const user = await requireActiveUser()
  const state = await getVouchDetailForParticipant({ vouchId })
  if (!("vouch" in state) || !state.vouch) notFound()

  const vouch = state.vouch
  const confirmState = await getConfirmPresencePageState({ vouchId })
  const canConfirm =
    confirmState.variant === "confirm_as_merchant" || confirmState.variant === "confirm_as_customer"
  const currentUserCode =
    "currentUserCode" in confirmState ? confirmState.currentUserCode : undefined
  const timeline = await getAuditTimeline(vouchId)

  return (
    <VouchDetailView
      title={vouch.publicId}
      amountLabel={money(vouch.amountCents, vouch.currency)}
      statusLabel={vouch.status}
      currentUserRoleLabel={
        confirmState.variant === "confirm_as_merchant"
          ? "merchant"
          : confirmState.variant === "confirm_as_customer"
            ? "customer"
            : "participant"
      }
      merchantLabel={participantName(vouch.merchant)}
      customerLabel={participantName(vouch.customer)}
      appointmentLabel={dateTime(vouch.appointmentAt)}
      windowLabel={dateTime(vouch.confirmationOpensAt)}
      deadlineLabel={dateTime(vouch.confirmationExpiresAt)}
      paymentStatusLabel={vouch.paymentRecord?.status ?? "not_started"}
      settlementStatusLabel={vouch.paymentRecord?.status ?? "pending"}
      merchantReceivesLabel={money(vouch.amountCents, vouch.currency)}
      customerTotalLabel={money(
        vouch.paymentRecord?.amountCents ?? vouch.amountCents,
        vouch.currency
      )}
      authorizationCheckoutUrl={
        user.id === vouch.merchantId ? (vouch.paymentRecord?.checkoutUrl ?? null) : null
      }
      confirmation={{
        merchantConfirmed:
          vouch.aggregateConfirmationStatus === "merchant_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        customerConfirmed:
          vouch.aggregateConfirmationStatus === "customer_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        canConfirm,
        action: canConfirm ? (
          <ConfirmPresenceInlineForm
            action={confirmPresenceFormAction}
            vouchId={vouchId}
            {...(currentUserCode ? { currentUserCode } : {})}
          />
        ) : null,
      }}
      timeline={timeline.map((event) => ({
        label: event.eventName,
        timestampLabel: dateTime(event.createdAt),
      }))}
    />
  )
}

function VouchDetailView({
  title,
  amountLabel,
  statusLabel,
  currentUserRoleLabel,
  merchantLabel,
  customerLabel,
  appointmentLabel,
  windowLabel,
  deadlineLabel,
  paymentStatusLabel,
  settlementStatusLabel,
  merchantReceivesLabel,
  customerTotalLabel,
  authorizationCheckoutUrl,
  confirmation,
  timeline,
}: VouchDetailViewProps) {
  const copy = vouchPageCopy.detail
  const statusTimeline = buildStatusTimeline({
    appointmentLabel,
    windowLabel,
    deadlineLabel,
    paymentStatusLabel,
    settlementStatusLabel,
    merchantConfirmed: confirmation.merchantConfirmed,
    customerConfirmed: confirmation.customerConfirmed,
    auditTimeline: timeline,
  })

  return (
    <main>
      <section className="px-4 py-16 md:px-8 lg:px-16">
        <VouchStatusDocument
          data={{
            title: copy.termsTitle,
            publicId: title,
            status: String(statusLabel),
            statusTone: statusToneFromLabel(String(statusLabel)),
            amountLabel,
            merchantReceivesLabel,
            customerTotalLabel,
            merchantLabel,
            customerLabel,
            appointmentLabel,
            confirmationOpensLabel: windowLabel,
            confirmationExpiresLabel: deadlineLabel,
            paymentStatusLabel,
            settlementStatusLabel,
            countdown: {
              label: "Confirmation window",
              expiresAtLabel: deadlineLabel,
              remainingLabel: deadlineLabel === "Not set" ? "Not set" : "Server timed",
              percentRemaining: confirmationProgress(confirmation),
              tone:
                confirmation.customerConfirmed && confirmation.merchantConfirmed
                  ? "complete"
                  : "active",
            },
            timeline: statusTimeline,
            confirmations: {
              merchantConfirmed: confirmation.merchantConfirmed,
              customerConfirmed: confirmation.customerConfirmed,
              action: (
                <div className="grid gap-4">
                  {confirmation.action}
                  {authorizationCheckoutUrl ? (
                    <AuthorizationCheckoutCard checkoutUrl={authorizationCheckoutUrl} />
                  ) : null}
                  <div className="border border-neutral-400 bg-neutral-900 p-4">
                    <p className="text-sm font-black text-white uppercase">{copy.actionsTitle}</p>
                    <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">
                      {copy.providerBoundary}
                    </p>
                  </div>
                </div>
              ),
            },
            audit: [
              { label: copy.labels.window, value: windowLabel },
              { label: copy.labels.expires, value: deadlineLabel },
              { label: copy.labels.status, value: String(statusLabel) },
              { label: copy.labels.role, value: currentUserRoleLabel },
              { label: copy.sections.payment, value: paymentStatusLabel },
              { label: "Settlement", value: settlementStatusLabel },
              { label: "Rule", value: copy.oneSidedRule },
            ],
          }}
        />
        <section className="border-3 border-neutral-400 bg-black p-4">
          <div className="mb-4 border-b border-neutral-400 pb-3">
            <h2 className="text-xl font-black tracking-wide uppercase">{copy.sections.timeline}</h2>
            {timeline.length === 0 ? (
              <p className="mt-2 text-sm font-semibold text-neutral-400">
                {copy.states.noTimeline}
              </p>
            ) : null}
          </div>
          <VouchStatusTimeline items={statusTimeline} />
        </section>
      </section>

      <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
        <VouchCountdown
          label={copy.bottomCalloutTitle}
          expiresAtLabel={deadlineLabel}
          remainingLabel={copy.bottomCalloutBody}
          percentRemaining={confirmationProgress(confirmation)}
          tone={
            confirmation.customerConfirmed && confirmation.merchantConfirmed ? "complete" : "active"
          }
        />
      </section>
    </main>
  )
}

function confirmationProgress(confirmation: ConfirmationState) {
  const confirmed = Number(confirmation.merchantConfirmed) + Number(confirmation.customerConfirmed)

  return (confirmed / 2) * 100
}

function statusToneFromLabel(
  status: string
): "active" | "pending" | "complete" | "failed" | "expired" {
  const normalized = status.toLowerCase()

  if (normalized.includes("expired") || normalized.includes("void")) return "expired"
  if (normalized.includes("fail") || normalized.includes("refund")) return "failed"
  if (normalized.includes("complete") || normalized.includes("captured")) return "complete"
  if (normalized.includes("pending") || normalized.includes("draft")) return "pending"

  return "active"
}

function buildStatusTimeline({
  appointmentLabel,
  windowLabel,
  deadlineLabel,
  paymentStatusLabel,
  settlementStatusLabel,
  merchantConfirmed,
  customerConfirmed,
  auditTimeline,
}: {
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantConfirmed: boolean
  customerConfirmed: boolean
  auditTimeline: { label: string; timestampLabel: string }[]
}): VouchStatusTimelineItem[] {
  const bothConfirmed = merchantConfirmed && customerConfirmed
  const withTime = (
    item: Omit<VouchStatusTimelineItem, "timeLabel"> & { timeLabel?: string | undefined }
  ): VouchStatusTimelineItem => {
    const { timeLabel, ...rest } = item

    return timeLabel ? { ...rest, timeLabel } : rest
  }

  return [
    withTime({
      id: "created",
      title: "Vouch created",
      description: "Application fee invoice paid, provider link issued, immutable state opened.",
      timeLabel: auditTimeline[0]?.timestampLabel,
      state: "completed",
      meta: paymentStatusLabel,
    }),
    withTime({
      id: "authorized",
      title: "Destination PaymentIntent",
      description: "Customer authorizes the hosted payment method and provider-backed intent.",
      timeLabel: appointmentLabel,
      state: paymentStatusLabel === "not_started" ? "upcoming" : "completed",
      meta: `payment=${paymentStatusLabel}`,
    }),
    withTime({
      id: "window",
      title: "Confirmation window",
      description: "Merchant and customer confirmations must both be written before expiration.",
      timeLabel: windowLabel,
      state: bothConfirmed ? "completed" : "current",
      meta: `expires=${deadlineLabel}`,
    }),
    {
      id: "merchant",
      title: "Merchant presence",
      description: "Idempotent server write records merchant confirmation.",
      state: merchantConfirmed ? "completed" : "upcoming",
      meta: merchantConfirmed ? "merchant_confirmed=true" : "merchant_confirmed=false",
    },
    {
      id: "customer",
      title: "Customer presence",
      description: "Idempotent server write records customer confirmation.",
      state: customerConfirmed ? "completed" : "upcoming",
      meta: customerConfirmed ? "customer_confirmed=true" : "customer_confirmed=false",
    },
    withTime({
      id: "settlement",
      title: "Capture or expire",
      description: bothConfirmed
        ? "Both writes are present in time, so server orchestration can signal capture."
        : "If both writes are not present in time, provider state resolves to expiration, void, or non-capture.",
      timeLabel: deadlineLabel,
      state: bothConfirmed ? "current" : "upcoming",
      meta: `settlement=${settlementStatusLabel}`,
    }),
    ...auditTimeline.slice(0, 4).map((event, index) =>
      withTime({
        id: `audit-${index}-${event.label}`,
        title: event.label,
        description: "Participant-safe audit log event.",
        timeLabel: event.timestampLabel,
        state: "completed" as const,
      })
    ),
  ]
}
