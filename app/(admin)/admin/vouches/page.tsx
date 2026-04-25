import { AdminTablePage } from "@/features/admin"

export default function AdminVouchesRoute() {
  return (
    <AdminTablePage
      title="Admin Vouches"
      description="Inspect Vouch lifecycle state. No arbitration controls."
      columns={[{ key: "id", label: "ID" }, { key: "status", label: "Status" }, { key: "paymentStatus", label: "Payment" }, { key: "deadline", label: "Deadline" }]}
      rows={[]}
    />
  )
}
