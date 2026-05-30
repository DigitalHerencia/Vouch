import type { ReactNode } from "react"

import { AuthFooter } from "@/components/navigation/auth-footer"
import { AuthProcessPanelGrid } from "../blocks/process-panel"

export interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="mx-auto h-dvh w-full overflow-hidden">
      <main>
        {children}
        <AuthProcessPanelGrid />
      </main>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <AuthFooter />
      </div>
    </div>
  )
}
