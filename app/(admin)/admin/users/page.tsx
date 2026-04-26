import { AdminTablePage } from "@/features/admin/admin-table-page"

export default function AdminUsersRoute() {
  return (
    <AdminTablePage
      title="Admin Users"
      description="Inspect user readiness and account status. No public profiles or reputation scores."
      columns={[
        { key: "id", label: "ID" },
        { key: "status", label: "Status" },
        { key: "verification", label: "Verification" },
        { key: "payout", label: "Payout" },
      ]}
      rows={[]}
    />
  )
}
