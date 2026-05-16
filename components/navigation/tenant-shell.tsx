import type { ReactNode } from "react"

import { TenantFooter } from "@/components/navigation/tenant-footer"
import { TenantHeader } from "@/components/navigation/tenant-header"
import { TenantMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { Shell } from "@/components/navigation/shell"

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
  const mobileBottomNav = (
    <TenantMobileBottomNav
      connectAction={connectAction}
      paymentAction={paymentAction}
    />
  )

  return (
    <Shell
      className={className}
      header={<TenantHeader connectAction={connectAction} paymentAction={paymentAction} />}
      footer={
        <TenantFooter
          className="hidden md:block"
          connectAction={connectAction}
          paymentAction={paymentAction}
        />
      }
      mobileBottomNav={mobileBottomNav}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8 lg:pt-12 lg:pb-12">
        {children}
      </div>
    </Shell>
  )
}
