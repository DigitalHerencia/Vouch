import { VouchDetailPage } from "@/features/vouches"
import { getParticipantSafeAuditTimeline, getVouchDetailForParticipant } from "@/lib/fetchers/vouchFetchers"

type PageProps = { params: Promise<{ vouchId: string }> }
const money = (cents: unknown, currency: unknown) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: String(currency ?? "usd").toUpperCase() }).format(Number(cents ?? 0) / 100)

export default async function Page({ params }: PageProps) {
  const { vouchId } = await params
  const state = await getVouchDetailForParticipant({ vouchId })
  const v = ("vouch" in state ? state.vouch : {}) as Record<string, unknown>
  const confirmations = (v.presenceConfirmations ?? []) as Array<Record<string, unknown>>
  const timeline = await getParticipantSafeAuditTimeline(vouchId)
  return <VouchDetailPage
    title={String(v.label ?? v.publicId ?? "Vouch")}
    amountLabel={money(v.amountCents, v.currency)}
    statusLabel={String(v.status ?? state.variant)}
    roleLabel="participant"
    otherPartyLabel="Participant"
    windowLabel={String(v.meetingStartsAt ?? "Scheduled window")}
    deadlineLabel={String(v.confirmationExpiresAt ?? "No deadline")}
    paymentStatusLabel={String((v.paymentRecord as Record<string, unknown> | undefined)?.status ?? "not_started")}
    confirmation={{
      payerConfirmed: confirmations.some((c) => c.participantRole === "payer" && c.status === "confirmed"),
      payeeConfirmed: confirmations.some((c) => c.participantRole === "payee" && c.status === "confirmed"),
      canConfirm: v.status === "active",
      confirmHref: `/vouches/${vouchId}/confirm`,
    }}
    timeline={timeline.map((e) => {
      const item = e as Record<string, unknown>
      return { label: String(item.eventName), timestampLabel: String(item.createdAt) }
    })}
  />
}
