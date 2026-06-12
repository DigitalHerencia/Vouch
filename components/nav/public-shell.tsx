type PublicShellProps = { children: React.ReactNode; withMobileBottomNav?: boolean }

import { PublicHeader } from "@/components/nav/public-header"
import { PublicFooter } from "@/components/nav/public-footer"
import { PublicMobileBottomNav } from "@/components/nav/public-mobile-bottom-nav"

export function PublicShell({ children, withMobileBottomNav = true }: PublicShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main
        className={[
          "mx-auto w-full max-w-[var(--vouch-page-max-width)] flex-1 px-[var(--vouch-page-x)] py-[var(--vouch-page-y)]",
          withMobileBottomNav ? "pb-28 md:pb-[var(--vouch-page-y)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>
      <PublicFooter />
      {withMobileBottomNav ? <PublicMobileBottomNav /> : null}
    </div>
  )
}
