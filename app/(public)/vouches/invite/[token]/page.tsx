import { AcceptVouchPage } from "@/features/vouches"
import { Button } from "@/components/ui/button"
import { acceptVouch, declineVouch, markInviteOpened } from "@/lib/actions/vouchActions"
import { getInviteLandingState } from "@/lib/fetchers/vouchFetchers"

type PageProps = { params: Promise<{ token: string }> }

export default async function InviteRoute({ params }: PageProps) {
  const { token } = await params
  const state = await getInviteLandingState(token)
  await markInviteOpened({ token })
  const invitation = "invitation" in state ? state.invitation as Record<string, unknown> : null
  const vouch = invitation?.vouch as Record<string, unknown> | undefined
  async function acceptAction() {
    "use server"
    await acceptVouch({ token })
  }
  async function declineAction() {
    "use server"
    await declineVouch({ token })
  }
  return (
    <AcceptVouchPage
      tokenValid={!["invalid_invite", "expired_invite", "already_accepted"].includes(state.variant)}
      signedIn={state.variant !== "unauthenticated"}
      eligible={state.variant === "authenticated_ready"}
      amountLabel={vouch?.amountCents ? `$${(Number(vouch.amountCents) / 100).toFixed(2)}` : "Unavailable"}
      payerLabel={String((vouch?.payer as Record<string, unknown> | undefined)?.displayName ?? "Payer")}
      windowLabel={String(vouch?.confirmationExpiresAt ?? "Unavailable")}
      setupHref={`/setup?return_to=${encodeURIComponent(`/vouches/invite/${token}`)}`}
      acceptAction={<form action={acceptAction}><Button type="submit">Accept Vouch</Button></form>}
      declineAction={<form action={declineAction}><Button type="submit" variant="outline">Decline</Button></form>}
    />
  )
}
