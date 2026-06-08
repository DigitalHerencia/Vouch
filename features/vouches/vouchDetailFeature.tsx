import { notFound } from "next/navigation"

import { PageTitle } from "@/components/vouches/page-title"
import { VouchStatusDocument } from "@/components/vouches/vouch-status-document"
import {
  ConfirmPresenceInlineForm,
  VouchDeadlineRefresh,
} from "@/features/vouches/vouchDetailFeature.client"
import { confirmPresenceFormAction } from "@/lib/actions/vouchActions"
import { mapVouchDetailDisplayDTO } from "@/lib/dto/vouch-detail-display.mappers"
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
    authorizationCheckoutUrl: null,
    auditTimeline: timeline,
    ...(currentUserCode ? { currentUserCode } : {}),
  })
  const confirmationAction = display.confirmationAction

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 md:gap-10" aria-labelledby="vouch-title">
      {display.refreshWindow ? (
        <VouchDeadlineRefresh
          confirmationOpensAt={display.refreshWindow.confirmationOpensAt}
          confirmationExpiresAt={display.refreshWindow.confirmationExpiresAt}
        />
      ) : null}
      <PageTitle {...display.pageTitle} variant="page" />
      <VouchStatusDocument
        data={{
          ...display.document,
          confirmations: {
            ...display.document.confirmations,
            action:
              confirmationAction.canConfirm && confirmationAction.confirmationExpiresAt ? (
                <ConfirmPresenceInlineForm
                  action={confirmPresenceFormAction}
                  vouchId={vouchId}
                  confirmationExpiresAt={confirmationAction.confirmationExpiresAt}
                  {...(confirmationAction.currentUserCode
                    ? { currentUserCode: confirmationAction.currentUserCode }
                    : {})}
                />
              ) : null,
          },
        }}
      />
    </section>
  )
}
