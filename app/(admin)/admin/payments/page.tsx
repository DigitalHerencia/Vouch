import { AdminTablePage } from "@/features/admin"

export default function AdminPaymentsRoute() {
  return (
    <AdminTablePage
      title="Admin Payments"
      description="Inspect payment-provider state, failures, refunds, and reconciliation status."
      columns={[{ key: "id", label: "ID" }, { key: "provider", label: "Provider" }, { key: "status", label: "Status" }, { key: "errorCode", label: "Error" }]}
      rows={[]}
    />
  )
}
