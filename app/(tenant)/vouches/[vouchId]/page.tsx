import { notFound } from "next/navigation"

import { ConfirmPresenceInlineForm } from "@/features/vouches/detail/confirm-presence-inline-form"
import { VouchDetailPage } from "@/features/vouches/detail/vouch-detail-page"
import {
  getConfirmPresencePageState,
  getParticipantSafeAuditTimeline,
  getVouchDetailForParticipant,
} from "@/lib/fetchers/vouchFetchers"

type PageProps = { params: Promise<{ vouchId: string }> }

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

const participantName = (participant: { displayName: string | null; email: string | null } | null) =>
  participant?.displayName ?? participant?.email ?? "Pending"

export default async function Page({ params }: PageProps) {
  const { vouchId } = await params
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
    <VouchDetailPage
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
        merchantConfirmed: vouch.aggregateConfirmationStatus === "merchant_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        customerConfirmed: vouch.aggregateConfirmationStatus === "customer_confirmed" ||
          vouch.aggregateConfirmationStatus === "both_confirmed",
        canConfirm,
        action: canConfirm ? (
          <ConfirmPresenceInlineForm
            vouchId={vouchId}
            {...(currentUserCode ? { currentUserCode } : {})}
          />
        ) : null,
      }}
      timeline={timeline.map((e) => {
        return { label: e.eventName, timestampLabel: dateTime(e.createdAt) }
      })}
    />
  )
}
