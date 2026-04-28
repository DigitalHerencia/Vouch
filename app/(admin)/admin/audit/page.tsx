import { AdminTablePage } from "@/features/admin/admin-table-page"
import { listAdminAuditEvents } from "@/lib/fetchers/adminFetchers"

export default async function AdminAuditRoute() {
  const rows = (await listAdminAuditEvents()).map((row) => {
    const a = row as Record<string, unknown>
    return {
      id: String(a.id),
      href: `/admin/audit/${a.id}`,
      eventName: String(a.eventName),
      actorType: String(a.actorType),
      createdAt: String(a.createdAt),
    }
  })
  return (
    <AdminTablePage
      title="Admin Audit"
      description="Inspect append-only audit events with safe metadata only."
      columns={[
        { key: "id", label: "ID" },
        { key: "eventName", label: "Event" },
        { key: "actorType", label: "Actor" },
        { key: "createdAt", label: "Created" },
      ]}
      rows={rows}
    />
  )
}
