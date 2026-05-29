import type { ReactNode } from "react"

import { AuthFooter } from "@/components/navigation/auth-footer"

export interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative h-dvh overflow-hidden">
      <main>{children}</main>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <AuthFooter />
      </div>
    </div>
  )
}
