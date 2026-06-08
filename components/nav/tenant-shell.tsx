import { TenantHeader } from "@/components/nav/tenant-header"
import { TenantFooter } from "@/components/nav/tenant-footer"
import { TenantMobileBottomNav } from "@/components/nav/mobile-bottom-nav"

export function TenantShell({
  children,
  connectAction,
  paymentAction,
  withMobileBottomNav = true,
}: TenantShellProps) {
  return (
    <div className="min-h-dvh">
      <TenantHeader connectAction={connectAction} paymentAction={paymentAction} />
      <main
        className={
          withMobileBottomNav ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-7xl pb-0"
        }
      >
        {children}
      </main>
      <TenantFooter connectAction={connectAction} paymentAction={paymentAction} />
      {withMobileBottomNav ? (
        <TenantMobileBottomNav connectAction={connectAction} paymentAction={paymentAction} />
      ) : null}
    </div>
  )
}
