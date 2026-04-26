import { AdminTablePage } from "@/features/admin/admin-table-page"

export default function AdminAuditRoute() {
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
      rows={[]}
    />
  )
}
