import { AdminTablePage } from "@/features/admin/admin-table-page"
import { listAdminWebhookEvents } from "@/lib/fetchers/adminFetchers"

export default async function Page() {
  const rows = (await listAdminWebhookEvents()).map((row) => {
    const w = row as Record<string, unknown>
    return {
      id: String(w.id),
      href: `/admin/webhooks/${w.id}`,
      eventType: String(w.eventType),
      processed: String(w.processed),
      receivedAt: String(w.receivedAt),
    }
  })
  return (
    <AdminTablePage
      title="Admin Webhooks"
      description="Inspect provider webhook processing state."
      columns={[
        { key: "id", label: "ID" },
        { key: "eventType", label: "Event" },
        { key: "processed", label: "Processed" },
        { key: "receivedAt", label: "Received" },
      ]}
      rows={rows}
    />
  )
}
