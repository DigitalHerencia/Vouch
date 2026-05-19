// components/navigation/tenant-shell.tsx

import type { ReactNode } from "react"

import { TenantFooter } from "@/components/navigation/tenant-footer"
import { TenantHeader } from "@/components/navigation/tenant-header"
import { TenantMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { cn } from "@/lib/utils"

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantShellProps {
  children: ReactNode
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  className?: string | undefined
  withMobileBottomNav?: boolean | undefined
}

export function TenantShell({
  children,
  connectAction,
  paymentAction,
  className,
  withMobileBottomNav = true,
}: TenantShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent", className)}>
      <TenantHeader connectAction={connectAction} paymentAction={paymentAction} />
      <main className={cn("mx-auto w-full max-w-7xl", !withMobileBottomNav ? "pb-0" : undefined)}>
        {children}
      </main>
      <TenantFooter connectAction={connectAction} paymentAction={paymentAction} />
      {withMobileBottomNav ? (
        <TenantMobileBottomNav connectAction={connectAction} paymentAction={paymentAction} />
      ) : null}
    </div>
  )
}
