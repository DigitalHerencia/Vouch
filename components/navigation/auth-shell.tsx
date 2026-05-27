import type { ReactNode } from "react"

import { AuthFooter } from "@/components/navigation/auth-footer"

export interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="h-full min-h-0 w-full overflow-hidden">{children}</div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10">
        <AuthFooter />
      </div>
    </div>
  )
}
