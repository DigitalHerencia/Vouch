import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { CalloutPanel } from "@/components/shared/callout-panel"
import { ConfirmationPanel } from "@/components/vouches/confirmation-panel"
import { LifecycleStatusPanel } from "@/components/vouches/lifecycle-status-panel"
import { PaymentStatusPanel } from "@/components/vouches/payment-status-panel"
import { VouchActionsPanel } from "@/components/vouches/vouch-actions-panel"
import { VouchCodeExchangePanel } from "@/components/vouches/vouch-code-exchange-panel"
import { VouchDetailHeader } from "@/components/vouches/vouch-detail-header"
import { VouchTermsSummary } from "@/components/vouches/vouch-terms-summary"
import { VouchTimelinePanel } from "@/components/vouches/vouch-timeline-panel"
import { vouchPageCopy } from "@/content/vouches"
import { ConfirmPresenceInlineForm } from "@/features/vouches/vouch-detail-page.client"
import { confirmPresenceFormAction } from "@/lib/actions/vouchActions"
import {
  getConfirmPresencePageState,
  getParticipantSafeAuditTimeline,
  getVouchDetailForParticipant,
} from "@/lib/fetchers/vouchFetchers"
import type { VouchStatus } from "@/types/vouch"

type ConfirmationState = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
  canConfirm: boolean
  action?: ReactNode
}

type VouchDetailPageProps = {
  vouchId: string
}

type VouchDetailViewProps = {
  vouchId: string
  title: string
  amountLabel: string
  statusLabel: VouchStatus | string
  currentUserRoleLabel: "merchant" | "customer" | "participant"
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  windowLabel: string
  deadlineLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  confirmation: ConfirmationState
  timeline: { label: string; timestampLabel: string }[]
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
  const state = await getVouchDetailForParticipant({ vouchId })
  if (!("vouch" in state) || !state.vouch) notFound()

  const vouch = state.vouch
  const confirmState = await getConfirmPresencePageState({ vouchId })
  const canConfirm =
    confirmState.variant === "confirm_as_merchant" || confirmState.variant === "confirm_as_customer"
  const currentUserCode =
    "currentUserCode" in confirmState ? confirmState.currentUserCode : undefined
  const timeline = await getParticipantSafeAuditTimeline(vouchId)

  return (
    <VouchDetailView
      vouchId={vouch.id}
      title={vouch.label ?? vouch.publicId}
      amountLabel={money(vouch.protectedAmountCents, vouch.currency)}
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
      appointmentLabel={dateTime(vouch.appointmentStartsAt)}
      windowLabel={dateTime(vouch.confirmationOpensAt)}
      deadlineLabel={dateTime(vouch.confirmationExpiresAt)}
      paymentStatusLabel={vouch.paymentRecord?.status ?? "not_started"}
      settlementStatusLabel={vouch.paymentRecord?.settlementStatus ?? "pending"}
      merchantReceivesLabel={money(vouch.merchantReceivesCents, vouch.currency)}
      customerTotalLabel={money(vouch.customerTotalCents, vouch.currency)}
      confirmation={{
        merchantConfirmed:
          vouch.aggregateConfirmationStatus === "merchant_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        customerConfirmed:
          vouch.aggregateConfirmationStatus === "customer_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        canConfirm,
        action: canConfirm ? (
          <VouchCodeExchangePanel>
            <ConfirmPresenceInlineForm
              action={confirmPresenceFormAction}
              vouchId={vouchId}
              {...(currentUserCode ? { currentUserCode } : {})}
            />
          </VouchCodeExchangePanel>
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
  vouchId,
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
  confirmation,
  timeline,
}: VouchDetailViewProps) {
  const copy = vouchPageCopy.detail

  return (
    <main className="grid w-full gap-8">
      <VouchDetailHeader
        vouchId={vouchId}
        title={title}
        amountLabel={amountLabel}
        appointmentLabel={appointmentLabel}
        statusLabel={statusLabel}
        currentUserRoleLabel={currentUserRoleLabel}
        copy={{ title: copy.title, heroBody: copy.heroBody }}
      />

      <VouchTermsSummary
        merchantLabel={merchantLabel}
        customerLabel={customerLabel}
        amountLabel={amountLabel}
        windowLabel={windowLabel}
        labels={copy.labels}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <ConfirmationPanel {...confirmation} />

        <div className="grid gap-5">
          <LifecycleStatusPanel
            title={copy.sections.schedule}
            appointmentLabel={appointmentLabel}
            windowLabel={windowLabel}
            deadlineLabel={deadlineLabel}
            labels={copy.labels}
          />
          <PaymentStatusPanel
            title={copy.sections.payment}
            amountLabel={amountLabel}
            merchantReceivesLabel={merchantReceivesLabel}
            customerTotalLabel={customerTotalLabel}
            paymentStatusLabel={paymentStatusLabel}
            settlementStatusLabel={settlementStatusLabel}
            labels={copy.labels}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <VouchTimelinePanel timeline={timeline} />
        <VouchActionsPanel />
      </div>

      <CalloutPanel title={copy.bottomCalloutTitle} body={copy.bottomCalloutBody} />
    </main>
  )
}
