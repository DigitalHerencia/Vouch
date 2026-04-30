import { AdminVouchDetailPage } from "@/features/admin/vouches/admin-vouch-detail-page"
import { getAdminVouchDetail, listAdminAuditEvents } from "@/lib/fetchers/adminFetchers"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function AdminVouchDetailRoute({ params }: PageProps) {
  const { vouchId } = await params
  const vouch = (await getAdminVouchDetail({ vouchId })) as Record<string, unknown> | null
  const audits = await listAdminAuditEvents({ entityType: "Vouch", entityId: vouchId })
  return (
    <AdminVouchDetailPage
      vouchId={vouchId}
      status={String(vouch?.status ?? "not_found")}
      payerId={String(vouch?.payerId ?? "unknown")}
      {...(vouch?.payeeId ? { payeeId: String(vouch.payeeId) } : {})}
      paymentStatus={String(
        (vouch?.paymentRecord as Record<string, unknown> | null)?.status ?? "not_started"
      )}
      refundStatus={String(
        (vouch?.refundRecord as Record<string, unknown> | null)?.status ?? "not_required"
      )}
      confirmationStatus={String(
        (vouch?.presenceConfirmations as unknown[] | undefined)?.length ?? 0
      )}
      auditEvents={audits.map((event) => {
        const e = event as Record<string, unknown>
        return {
          id: String(e.id),
          eventName: String(e.eventName),
          actorType: String(e.actorType),
          createdAtLabel: String(e.createdAt),
        }
      })}
    />
  )
}
