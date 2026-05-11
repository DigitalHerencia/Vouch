// components/navigation/admin-shell.tsx

import type { ReactNode } from "react"
import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AdminShellProps {
    children: ReactNode
    className?: string | undefined
}

const adminNavItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/vouches", label: "Vouches" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/audit", label: "Audit" },
    { href: "/admin/webhooks", label: "Webhooks" },
] as const

export function AdminShell({ children, className }: AdminShellProps) {
    return (
        <div className={cn("min-h-dvh bg-transparent text-neutral-50", className)}>
            <header className="sticky top-0 z-40 h-19 border-b border-neutral-900 bg-black/90 backdrop-blur supports-backdrop-filter:bg-black/78">
                <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin"
                            aria-label="Vouch admin"
                            className="inline-flex items-center gap-3 text-neutral-50"
                        >
                            <LogoLockup />
                            <span className="hidden border-l border-neutral-800 pl-3 font-(family-name:--font-display) text-[18px] leading-none tracking-[0.08em] text-neutral-400 uppercase lg:inline">
                                Admin
                            </span>
                        </Link>

                        <nav
                            aria-label="Admin navigation"
                            className="hidden items-center gap-2 md:flex"
                        >
                            {adminNavItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant="ghost"
                                    size="sm"
                                    render={<Link href={item.href} />}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    </div>

                    <UserMenu />
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {children}
            </main>
        </div>
    )
}
