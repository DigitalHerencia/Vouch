import type { ReactNode } from "react"

import { AuthProcessPanelGrid } from "@/components/blocks/process-panel"
import { AuthFooter } from "@/components/navigation/auth-footer"

export interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative mx-auto h-dvh w-full overflow-hidden">
      <main className="relative isolate min-h-dvh">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2"
        >
          <AuthProcessPanelGrid />
        </div>

        <div className="relative z-10 min-h-dvh">{children}</div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <AuthFooter />
      </div>
    </div>
  )
}
