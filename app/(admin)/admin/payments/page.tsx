import { AdminTablePage } from "@/features/admin/admin-table-page"
import { listAdminPayments } from "@/lib/fetchers/adminFetchers"

export default async function AdminPaymentsRoute() {
  const rows = (await listAdminPayments()).map((row) => {
    const p = row as Record<string, unknown>
    return {
      id: String(p.id),
      href: `/admin/payments/${p.id}`,
      provider: String(p.provider),
      status: String(p.status),
      errorCode: String(p.lastErrorCode ?? ""),
    }
  })
  return (
    <AdminTablePage
      title="Admin Payments"
      description="Inspect payment-provider state, failures, refunds, and reconciliation status."
      columns={[
        { key: "id", label: "ID" },
        { key: "provider", label: "Provider" },
        { key: "status", label: "Status" },
        { key: "errorCode", label: "Error" },
      ]}
      rows={rows}
    />
  )
}
