// components/navigation/app-shell.tsx

import type { ReactNode } from "react"

import { AppHeader } from "@/components/navigation/app-header"
import { AppMobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { cn } from "@/lib/utils"

export interface AppShellProps {
    children: ReactNode
    className?: string | undefined
}

export function AppShell({ children, className }: AppShellProps) {
    return (
        <div className={cn("min-h-dvh bg-transparent text-neutral-50", className)}>
            <AppHeader />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:py-12">
                {children}
            </main>
            <AppMobileBottomNav />
        </div>
    )
}

export { AppShell as TenantShell }
