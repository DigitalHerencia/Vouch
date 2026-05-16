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
    <div className={cn("flex min-h-dvh flex-col bg-transparent text-foreground", className)}>
      <PublicHeader />
      <div className={cn("flex-1 bg-transparent", withMobileBottomNav && "pb-20 md:pb-0")}>{children}</div>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
