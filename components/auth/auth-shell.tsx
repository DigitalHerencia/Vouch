import type { ReactNode } from "react"

import { AuthFooter } from "@/components/auth/auth-footer"
import { AuthHeader } from "@/components/auth/auth-header"

import { cn } from "@/lib/utils"

export interface AuthShellProps {
  children: ReactNode
  className?: string
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className={cn("relative h-dvh overflow-hidden bg-transparent", className)}>
      <div className="h-full min-h-0 w-full overflow-hidden">{children}</div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:block" />
        <div className="pointer-events-auto">
          <AuthHeader />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 grid grid-cols-1 md:grid-cols-2">
        <div className="pointer-events-auto">
          <AuthFooter />
        </div>
        <div className="hidden md:block" />
      </div>
    </div>
  )
}
