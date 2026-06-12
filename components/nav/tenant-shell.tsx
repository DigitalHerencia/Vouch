type TenantStripeAction = ((formData: FormData) => void | Promise<void>) | undefined

type TenantShellProps = {
  children: React.ReactNode
  connectAction?: TenantStripeAction
  connectReady: boolean
  withMobileBottomNav?: boolean
}

import { TenantHeader } from "@/components/nav/tenant-header"
import { TenantFooter } from "@/components/nav/tenant-footer"
import { TenantMobileBottomNav } from "@/components/nav/tenant-mobile-bottom-nav"

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
          "mx-auto w-full max-w-[var(--vouch-page-max-width)] flex-1 px-[var(--vouch-page-x)] py-[var(--vouch-page-y)]",
          withMobileBottomNav ? "pb-28 md:pb-[var(--vouch-page-y)]" : "",
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
