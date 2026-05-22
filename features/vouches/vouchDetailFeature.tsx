import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { InvoiceBlocks } from "@/components/blocks/invoice"
import { ConfirmationPanel } from "@/components/vouches/confirmation-panel"
import { LifecycleStatusPanel } from "@/components/vouches/lifecycle-status-panel"
import { VouchActionsPanel } from "@/components/vouches/vouch-actions-panel"
import { VouchCodeExchangePanel } from "@/components/vouches/vouch-code-exchange-panel"
import { VouchDetailHeader } from "@/components/vouches/vouch-detail-header"
import { VouchTimelinePanel } from "@/components/vouches/vouch-timeline-panel"
import { vouchPageCopy } from "@/content/vouches"
import { ConfirmPresenceInlineForm } from "@/features/vouches/vouchDetailFeature.client"
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
          <VouchCodeExchangePanel
            title={vouchPageCopy.detail.confirmDrawerTitle}
            body={vouchPageCopy.detail.confirmDrawerBody}
          >
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
    <main className="grid min-h-[calc(100dvh-8rem)] grid-rows-none gap-4 sm:gap-6 md:grid-rows-3 md:gap-8">
      <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
        <VouchDetailHeader
          vouchId={vouchId}
          title={title}
          amountLabel={amountLabel}
          appointmentLabel={appointmentLabel}
          statusLabel={statusLabel}
          currentUserRoleLabel={currentUserRoleLabel}
          copy={{
            title: copy.title,
            heroBody: copy.heroBody,
            labels: {
              status: copy.labels.status,
              amount: copy.labels.amount,
              role: copy.labels.role,
            },
          }}
        />
        <LifecycleStatusPanel
          title={copy.sections.schedule}
          appointmentLabel={appointmentLabel}
          windowLabel={windowLabel}
          deadlineLabel={deadlineLabel}
          labels={copy.labels}
        />
      </section>

      <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-8">
        <InvoiceBlocks.Full
          data={{
            title: copy.termsTitle,
            invoiceNumber: title,
            issueDate: appointmentLabel,
            dueDate: deadlineLabel,
            status: String(statusLabel),
            from: {
              name: merchantLabel,
              address: copy.labels.merchant,
              city: currentUserRoleLabel,
              zip: "",
            },
            to: {
              name: customerLabel,
              address: copy.labels.customer,
              city: "participant",
              zip: "",
            },
            items: [
              {
                description: copy.labels.vouchAmount,
                quantity: 1,
                unitPrice: 0,
                unitPriceLabel: amountLabel,
                totalLabel: amountLabel,
              },
              {
                description: copy.labels.merchantReceives,
                quantity: 1,
                unitPrice: 0,
                unitPriceLabel: merchantReceivesLabel,
                totalLabel: merchantReceivesLabel,
              },
              {
                description: copy.labels.customerAuthorizes,
                quantity: 1,
                unitPrice: 0,
                unitPriceLabel: customerTotalLabel,
                totalLabel: customerTotalLabel,
              },
            ],
            subtotal: 0,
            total: 0,
            details: [
              { label: copy.labels.window, value: windowLabel },
              { label: copy.labels.expires, value: deadlineLabel },
              { label: copy.labels.status, value: String(statusLabel) },
              { label: copy.labels.role, value: currentUserRoleLabel },
              { label: copy.sections.payment, value: paymentStatusLabel },
              { label: "Settlement", value: settlementStatusLabel },
            ],
            notes: copy.ruleDescription,
            terms: copy.oneSidedRule,
            actions: (
              <div className="grid gap-4">
                <ConfirmationPanel {...confirmation} />
                <VouchActionsPanel
                  title={copy.actionsTitle}
                  providerBoundary={copy.providerBoundary}
                />
              </div>
            ),
          }}
        />
        <VouchTimelinePanel
          timeline={timeline}
          title={copy.sections.timeline}
          emptyLabel={copy.states.noTimeline}
        />
      </section>

      <section className="grid min-h-0 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
        <InvoiceBlocks.Summary
          invoiceNumber={copy.bottomCalloutTitle}
          clientName={copy.bottomCalloutBody}
          issueDate={paymentStatusLabel}
          dueDate={settlementStatusLabel}
          amount={0}
          amountLabel={customerTotalLabel}
          status={String(statusLabel)}
          href={`/vouches/${vouchId}`}
        />
      </section>
    </main>
  )
}
