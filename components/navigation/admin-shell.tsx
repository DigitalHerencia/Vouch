// components/navigation/admin-shell.tsx

import type { ReactNode } from "react"
import Link from "next/link"

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
            <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/90 backdrop-blur">
                <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin"
                            className="font-(family-name:--font-display) text-[24px] leading-none tracking-[0.04em] text-white uppercase"
                        >
                            Vouch Admin
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

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
