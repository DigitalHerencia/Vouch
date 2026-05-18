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
    <div className={cn("flex min-h-dvh flex-col", className)}>
      <PublicHeader />
      <div
        className={cn(
          "mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-7xl px-4 py-4 sm:px-6 md:min-h-[calc(100dvh-8rem)] md:px-8 md:py-8",
          withMobileBottomNav && "pb-20 md:pb-0"
        )}
      >
        {children}
      </div>
      <div className="hidden md:block">
        <PublicFooter />
      </div>
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
