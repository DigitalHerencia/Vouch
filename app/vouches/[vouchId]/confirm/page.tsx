import { ConfirmPresencePage } from "@/features/vouches"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function ConfirmPresenceRoute({ params }: PageProps) {
  const { vouchId } = await params
  return (
    <ConfirmPresencePage
      title={`Confirm Vouch ${vouchId}`}
      amountLabel="$0.00"
      deadlineLabel="Not loaded"
      payerConfirmed={false}
      payeeConfirmed={false}
      canConfirm={false}
      blockedReason="Confirmation is unavailable until the Vouch is active and the confirmation window is open."
    />
  )
}
