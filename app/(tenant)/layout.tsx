// app/(tenant)/layout.tsx

import { TenantShell } from "@/components/nav/tenant-shell"
import { openStripeConnectDashboard } from "@/lib/actions/paymentActions"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireActiveUser()

  return (
    <TenantShell connectAction={openStripeConnectDashboard}>
      {children}
    </TenantShell>
  )
}
