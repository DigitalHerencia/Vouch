// components/navigation/tenant-shell.tsx

import type { ReactNode } from "react"

import { TenantHeader } from "@/components/navigation/tenant-header"
import { TenantFooter } from "@/components/navigation/tenant-footer"
import { TenantMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantShellProps {
  children: ReactNode
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  withMobileBottomNav?: boolean | undefined
}

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
