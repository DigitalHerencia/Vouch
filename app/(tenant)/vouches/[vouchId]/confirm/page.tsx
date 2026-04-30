import { ConfirmPresencePage } from "@/features/vouches"
import { confirmPresence } from "@/lib/actions/vouchActions"
import { getConfirmPresencePageState } from "@/lib/fetchers/vouchFetchers"
import { Button } from "@/components/ui/button"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function Page({ params }: PageProps) {
  const { vouchId } = await params
  const state = await getConfirmPresencePageState({ vouchId })
  async function action() {
    "use server"
    await confirmPresence({ vouchId })
  }
  return (
    <ConfirmPresencePage
      title="Confirm presence"
      statusLabel={state.variant}
      windowLabel="Confirmation window"
      deadlineLabel="Before the deadline"
      alreadyConfirmed={state.variant === "already_confirmed"}
      canConfirm={state.variant === "confirm_as_payer" || state.variant === "confirm_as_payee"}
      {...(state.variant.includes("window") || state.variant.includes("unauthorized")
        ? { blockedReason: state.variant }
        : {})}
      confirmationAction={
        <form action={action}>
          <Button type="submit">Confirm Presence</Button>
        </form>
      }
    />
  )
}
