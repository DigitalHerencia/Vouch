import type { ReactNode } from "react"

import { TenantFooter } from "@/components/navigation/tenant-footer"
import { TenantHeader } from "@/components/navigation/tenant-header"
import { TenantMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import {
  openStripeConnectDashboard,
  openStripePaymentMethodDashboard,
} from "@/lib/actions/paymentActions"
import { cn } from "@/lib/utils"

export interface TenantShellProps {
  children: ReactNode
  className?: string | undefined
}

export function TenantShell({ children, className }: TenantShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent text-neutral-50", className)}>
      <TenantHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-32 sm:px-6 md:pb-8 lg:px-8 lg:pt-12 lg:pb-12">
        {children}
      </main>
      <TenantFooter className="hidden md:block" />
      <TenantMobileBottomNav
        connectAction={openStripeConnectDashboard}
        paymentAction={openStripePaymentMethodDashboard}
      />
    </div>
  )
}
