// app/(tenant)/layout.tsx

import { TenantShell } from "@/components/navigation/tenant-shell"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    await requireActiveUser()

    return <TenantShell>{children}</TenantShell>
}
