import type { ReactNode } from "react"

import { TenantFooter } from "@/components/navigation/tenant-footer"
import { TenantHeader } from "@/components/navigation/tenant-header"
import { TenantMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { Shell } from "@/components/navigation/shell"
import {
  openStripeConnectDashboard,
  openStripePaymentMethodDashboard,
} from "@/lib/actions/paymentActions"

export interface TenantShellProps {
  children: ReactNode
  className?: string | undefined
}

export function TenantShell({ children, className }: TenantShellProps) {
  const mobileBottomNav = (
    <TenantMobileBottomNav
      connectAction={openStripeConnectDashboard}
      paymentAction={openStripePaymentMethodDashboard}
    />
  )

  return (
    <Shell
      className={className}
      header={<TenantHeader />}
      footer={<TenantFooter className="hidden md:block" />}
      mobileBottomNav={mobileBottomNav}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8 lg:pt-12 lg:pb-12">
        {children}
      </div>
    </Shell>
  )
}
