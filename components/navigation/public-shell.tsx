// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicHeader } from "@/components/navigation/public-header"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"

export function PublicShell({ children, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main
        className={
          withMobileBottomNav ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-7xl pb-0"
        }
      >
        {children}
      </main>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
