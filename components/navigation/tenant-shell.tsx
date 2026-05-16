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
}

export function TenantShell({
  children,
  connectAction,
  paymentAction,
  className,
}: TenantShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-transparent text-foreground", className)}>
      <TenantHeader connectAction={connectAction} paymentAction={paymentAction} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
      <TenantMobileBottomNav
        connectAction={connectAction}
        paymentAction={paymentAction}
      />
      <TenantFooter
        className="hidden md:block"
        connectAction={connectAction}
        paymentAction={paymentAction}
      />
    </div>
  )
}
