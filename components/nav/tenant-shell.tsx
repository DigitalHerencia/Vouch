type TenantStripeAction = ((formData: FormData) => void | Promise<void>) | undefined

type TenantShellProps = {
  children: React.ReactNode
  connectAction?: TenantStripeAction
  connectReady: boolean
  withMobileBottomNav?: boolean
}

import { TenantHeader } from "@/components/nav/tenant-header"
import { TenantFooter } from "@/components/nav/tenant-footer"
import { TenantMobileBottomNav } from "@/components/nav/mobile-bottom-nav"

export function TenantShell({
  children,
  connectAction,
  connectReady,
  withMobileBottomNav = true,
}: TenantShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TenantHeader connectAction={connectAction} connectReady={connectReady} />
      <main
        className={[
          "mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
          withMobileBottomNav ? "pb-28 sm:pb-12 lg:pb-16" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>
      <TenantFooter connectAction={connectAction} connectReady={connectReady} />
      {withMobileBottomNav ? (
        <TenantMobileBottomNav connectAction={connectAction} connectReady={connectReady} />
      ) : null}
    </div>
  )
}
