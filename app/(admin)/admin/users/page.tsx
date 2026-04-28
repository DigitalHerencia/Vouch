import { AdminTablePage } from "@/features/admin/admin-table-page"
import { listAdminUsers } from "@/lib/fetchers/adminFetchers"

export default async function AdminUsersRoute() {
  const rows = (await listAdminUsers()).map((row) => {
    const u = row as Record<string, unknown>
    const profile = u.verificationProfile as Record<string, unknown> | null
    const account = u.connectedAccount as Record<string, unknown> | null
    return {
      id: String(u.id),
      href: `/admin/users/${u.id}`,
      status: String(u.status),
      verification: String(profile?.identityStatus ?? "unstarted"),
      payout: String(account?.readiness ?? "not_started"),
    }
  })
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
      rows={rows}
    />
  )
}
