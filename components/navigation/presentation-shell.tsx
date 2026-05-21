// components/navigation/public-shell.tsx

import type { ReactNode } from "react"

import { PublicMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PublicFooter } from "@/components/navigation/public-footer"
import { PresentationHeader } from "@/components/navigation/presentation-header"
import { cn } from "@/lib/utils"

export interface PresentationShellProps {
  children: ReactNode
  className?: string | undefined
  withMobileBottomNav?: boolean | undefined
}

export function PresentationShell({
  children,
  className,
  withMobileBottomNav = true,
}: PresentationShellProps) {
  return (
    <div className={cn("min-h-dvh bg-transparent", className)}>
      <PresentationHeader />
      <main className={cn("mx-auto w-full max-w-7xl", !withMobileBottomNav ? "pb-0" : undefined)}>
        {children}
      </main>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
