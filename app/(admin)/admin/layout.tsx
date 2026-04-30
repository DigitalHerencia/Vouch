import { AdminShell } from "@/components/layout/admin-shell"
import { assertAdmin } from "@/lib/authz/admin"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await assertAdmin()
  return <AdminShell>{children}</AdminShell>
}
