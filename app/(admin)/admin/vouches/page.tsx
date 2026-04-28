import { AdminTablePage } from "@/features/admin/admin-table-page"
import { listAdminVouches } from "@/lib/fetchers/adminFetchers"

export default async function AdminVouchesRoute() {
  const rows = (await listAdminVouches()).map((row) => {
    const v = row as Record<string, unknown>
    return {
      id: String(v.id),
      href: `/admin/vouches/${v.id}`,
      status: String(v.status),
      paymentStatus: String((v.paymentRecord as Record<string, unknown> | null)?.status ?? "not_started"),
      deadline: String(v.confirmationExpiresAt ?? ""),
    }
  })
  return (
    <AdminTablePage
      title="Admin Vouches"
      description="Inspect Vouch lifecycle state. No arbitration controls."
      columns={[
        { key: "id", label: "ID" },
        { key: "status", label: "Status" },
        { key: "paymentStatus", label: "Payment" },
        { key: "deadline", label: "Deadline" },
      ]}
      rows={rows}
    />
  )
}
