// app/(admin)/admin/layout.tsx

import { AdminShell } from "@/components/navigation/admin-shell"
import { assertAdmin } from "@/lib/authz/admin"

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    await assertAdmin()

    return <AdminShell>{children}</AdminShell>
}
