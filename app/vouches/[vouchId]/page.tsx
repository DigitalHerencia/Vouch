import { VouchDetailPage } from "@/features/vouches"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function VouchDetailRoute({ params }: PageProps) {
  const { vouchId } = await params
  return (
    <VouchDetailPage
      title={`Vouch ${vouchId}`}
      amountLabel="$0.00"
      statusLabel="Pending"
      roleLabel="Participant"
      otherPartyLabel="Unavailable"
      windowLabel="Not loaded"
      deadlineLabel="Not loaded"
      paymentStatusLabel="not_started"
      confirmation={{ payerConfirmed: false, payeeConfirmed: false, canConfirm: false }}
      timeline={[]}
    />
  )
}
