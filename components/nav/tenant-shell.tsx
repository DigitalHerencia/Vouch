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
    <div className="flex min-h-dvh flex-col">
      <TenantHeader connectAction={connectAction} paymentAction={paymentAction} />
      <main
        className={[
          "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
          withMobileBottomNav ? "pb-28 sm:pb-10 lg:pb-12" : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
