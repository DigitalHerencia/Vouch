// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { LandingPublicFooter } from "@/components/landing/landing-public-footer"
import { LandingPublicHeader } from "@/components/landing/landing-public-header"
import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { cn } from "@/lib/utils"

export interface PublicShellProps {
  children: ReactNode
  className?: string | undefined
  withMobileBottomNav?: boolean | undefined
}

export function PublicShell({ children, className, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent text-white", className)}>
      <LandingPublicHeader />
      <main className={cn(withMobileBottomNav ? "pb-24 md:pb-0" : undefined)}>{children}</main>
      <LandingPublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
