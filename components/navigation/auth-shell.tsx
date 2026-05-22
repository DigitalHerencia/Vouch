import type { ReactNode } from "react"

import { AuthFooter } from "@/components/navigation/auth-footer"
import { AuthHeader } from "@/components/navigation/auth-header"

export interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative h-dvh overflow-hidden">
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
