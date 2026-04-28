import { AdminDashboardPage } from "@/features/admin/admin-dashboard-page"
import { getAdminDashboardSummary } from "@/lib/fetchers/adminFetchers"

export default async function AdminRoute() {
  const summary = await getAdminDashboardSummary()
  const counts = summary.counts
  return (
    <AdminDashboardPage
      metrics={[
        {
          label: "Total Vouches",
          value: Object.values(counts.vouchesByStatus).reduce((a, b) => a + Number(b), 0),
          description: "All recorded Vouches",
          href: "/admin/vouches",
        },
        {
          label: "Failed payments",
          value: counts.paymentFailures,
          description: "Provider failures requiring inspection",
          href: "/admin/payments",
        },
        {
          label: "Users",
          value: "Open",
          description: "Operational user records",
          href: "/admin/users",
        },
        {
          label: "Audit events",
          value: "Open",
          description: "Append-only operational history",
          href: "/admin/audit",
        },
      ]}
    />
  )
}
