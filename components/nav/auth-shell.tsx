type AuthShellProps = { children: React.ReactNode }

import { AuthFooter } from "@/components/nav/auth-footer"
import { AuthProcessPanelGrid } from "@/components/shared/auth-process-panel-grid"

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative mx-auto min-h-dvh w-full overflow-hidden">
      <main className="relative isolate flex min-h-dvh w-full items-center justify-center px-[var(--vouch-page-x)] py-[var(--vouch-page-y)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2"
        >
          <AuthProcessPanelGrid />
        </div>

        <div className="relative z-10 w-full">{children}</div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <AuthFooter />
      </div>
    </div>
  )
}
