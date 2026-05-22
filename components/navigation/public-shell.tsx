// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicHeader } from "@/components/navigation/public-header"

export interface PublicShellProps {
  children: ReactNode
  withMobileBottomNav?: boolean | undefined
}

export function PublicShell({ children, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main className={withMobileBottomNav ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-7xl pb-0"}>
        {children}
      </main>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
