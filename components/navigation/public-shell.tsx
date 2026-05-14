// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"
import { Shell } from "@/components/navigation/shell"

export interface PublicShellProps {
  children: ReactNode
  className?: string | undefined
  withMobileBottomNav?: boolean | undefined
}

export function PublicShell({ children, className, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <Shell
      className={className}
      header={<PublicHeader />}
      footer={<PublicFooter />}
      mobileBottomNav={withMobileBottomNav ? <PublicMobileBottomNav /> : undefined}
      mainClassName={withMobileBottomNav ? undefined : "pb-0"}
    >
      {children}
    </Shell>
  )
}
