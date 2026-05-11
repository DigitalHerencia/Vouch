// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"
import { cn } from "@/lib/utils"

export interface PublicShellProps {
  children: ReactNode
  className?: string | undefined
  withMobileBottomNav?: boolean | undefined
}

export function PublicShell({ children, className, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent text-white", className)}>
      <PublicHeader />
      <main className={cn(withMobileBottomNav ? "pb-24 md:pb-0" : undefined)}>{children}</main>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
