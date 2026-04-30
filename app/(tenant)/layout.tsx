import { AppShell } from "@/components/layout/app-shell"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireActiveUser()
  return <AppShell>{children}</AppShell>
}
