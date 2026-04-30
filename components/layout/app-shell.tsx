import { AppHeader } from "@/components/layout/app-header"
import { AppMobileBottomNav } from "@/components/layout/app-mobile-bottom-nav"
import { cn } from "@/lib/utils"

export interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-svh bg-neutral-950 text-neutral-50", className)}>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8">{children}</main>
      <AppMobileBottomNav />
    </div>
  )
}
