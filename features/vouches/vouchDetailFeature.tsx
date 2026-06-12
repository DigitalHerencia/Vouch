import { notFound } from "next/navigation"

import { VouchStatusDocument } from "@/components/vouches/vouch-status-document"
import { ConfirmPresenceInlineForm } from "@/features/vouches/vouchDetailFeature.client"
import { VouchDeadlineRefresh } from "@/features/vouches/vouch-deadline-refresh"
import { confirmPresence } from "@/lib/actions/vouchActions"
import { mapVouchDetailDisplayDTO } from "@/lib/db/dto/vouch-detail-display.mappers"
import { getVouchDetailPageState } from "@/lib/fetchers/vouchFetchers"

type VouchDetailPageProps = {
  vouchId: string
}

export async function VouchDetailPage({ vouchId }: VouchDetailPageProps) {
  const state = await getVouchDetailPageState({ vouchId })
  if (!state) notFound()

  const { canConfirm, currentUserCode, role, timeline, vouch } = state

  const display = mapVouchDetailDisplayDTO({
    vouch,
    role,
    canConfirm,
    authorizationCheckoutUrl: vouch.paymentRecord?.checkoutUrl ?? null,
    auditTimeline: timeline,
    ...(currentUserCode ? { currentUserCode } : {}),
  })

  const confirmationAction = display.confirmationAction

  return (
    <section
      className="mx-auto grid w-full max-w-6xl gap-[var(--vouch-section-gap)]"
      aria-labelledby="vouch-title"
    >
      {display.refreshWindow ? (
        <VouchDeadlineRefresh
          confirmationOpensAt={display.refreshWindow.confirmationOpensAt}
          confirmationExpiresAt={display.refreshWindow.confirmationExpiresAt}
        />
      ) : null}

      <VouchStatusDocument
        data={{
          ...display.document,
          confirmations: {
            ...display.document.confirmations,
            action:
              confirmationAction.confirmationExpiresAt && confirmationAction.currentUserCode ? (
                <ConfirmPresenceInlineForm
                  action={confirmPresence}
                  canConfirm={confirmationAction.canConfirm}
                  vouchId={vouchId}
                  confirmationExpiresAt={confirmationAction.confirmationExpiresAt}
                  currentUserCode={confirmationAction.currentUserCode}
                />
              ) : null,
          },
        }}
      />
    </section>
  )
}
