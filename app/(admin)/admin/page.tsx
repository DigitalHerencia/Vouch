import { AdminDashboardPage } from "@/features/admin"

export default function AdminRoute() {
  return (
    <AdminDashboardPage
      metrics={[
        { label: "Total Vouches", value: "0", description: "All recorded Vouches", href: "/admin/vouches" },
        { label: "Failed payments", value: "0", description: "Provider failures requiring inspection", href: "/admin/payments" },
        { label: "Users", value: "0", description: "Operational user records", href: "/admin/users" },
        { label: "Audit events", value: "0", description: "Append-only operational history", href: "/admin/audit" },
      ]}
    />
  )
}
