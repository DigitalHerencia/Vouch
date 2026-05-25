// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PresentationHeader } from "@/components/(presentation)/presentation-header"

export interface PresentationShellProps {
  children: ReactNode
  withMobileBottomNav?: boolean | undefined
}

export function PresentationShell({
  children,
  withMobileBottomNav = true,
}: PresentationShellProps) {
  return (
    <div className="min-h-dvh">
      <PresentationHeader />
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
