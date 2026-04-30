import { AdminTablePage } from "@/features/admin/admin-table-page"
import { getAdminAuditEventDetail } from "@/lib/fetchers/adminFetchers"

type PageProps = { params: Promise<{ eventId: string }> }

export default async function Page({ params }: PageProps) {
  const { eventId } = await params
  const event = (await getAdminAuditEventDetail({ auditEventId: eventId })) as Record<
    string,
    unknown
  > | null
  return (
    <AdminTablePage
      title="Admin Audit Detail"
      description="Safe audit metadata only."
      columns={[
        { key: "id", label: "ID" },
        { key: "eventName", label: "Event" },
        { key: "actorType", label: "Actor" },
        { key: "createdAt", label: "Created" },
      ]}
      rows={
        event
          ? [
              {
                id: String(event.id),
                eventName: String(event.eventName),
                actorType: String(event.actorType),
                createdAt: String(event.createdAt),
              },
            ]
          : []
      }
    />
  )
}
