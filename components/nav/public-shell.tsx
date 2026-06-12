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
          "mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
          withMobileBottomNav ? "pb-28 sm:pb-12 lg:pb-16" : "",
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
