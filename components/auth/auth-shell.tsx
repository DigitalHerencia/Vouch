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
    <div className={cn("bg-transparent", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div />
        <AuthHeader />
      </div>
      <main className="mx-auto h-[calc(100vh-9rem)] w-full overflow-hidden">{children}</main>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div />
        <AuthFooter />
      </div>
    </div>
  )
}
