// app/(tenant)/layout.tsx

import { TenantShell } from "@/components/nav/tenant-shell"
import { openStripeConnectDashboard } from "@/lib/actions/paymentActions"
import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { getAccountReadiness } from "@/lib/fetchers/readinessFetchers"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireActiveUser()
  const readiness = await getAccountReadiness(user.id)

  return (
    <TenantShell
      connectAction={openStripeConnectDashboard}
      connectReady={readiness?.payoutReadiness === "ready"}
    >
      {children}
    </TenantShell>
  )
}
