import { TenantHeader } from "@/components/nav/tenant-header"
import { TenantFooter } from "@/components/nav/tenant-footer"
import { TenantMobileBottomNav } from "@/components/nav/mobile-bottom-nav"

const shellWidth = {
  default: "max-w-7xl",
  narrow: "max-w-5xl",
  detail: "max-w-6xl",
  full: "max-w-none",
} as const

export function TenantShell({
  children,
  connectAction,
  paymentAction,
  withMobileBottomNav = true,
  maxWidth = "default",
}: TenantShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TenantHeader connectAction={connectAction} paymentAction={paymentAction} />
      <main
        className={[
          "mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
          shellWidth[maxWidth],
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
