// app/(tenant)/layout.tsx

import { AppShell } from "@/components/navigation/app-shell"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    await requireActiveUser()

    return <AppShell>{children}</AppShell>
}
