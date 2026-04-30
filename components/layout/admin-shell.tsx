import Link from "next/link"

import { UserMenu } from "@/components/auth/user-menu"
import { cn } from "@/lib/utils"

export interface AdminShellProps {
  children: React.ReactNode
  className?: string
}

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/vouches", label: "Vouches" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/audit", label: "Audit" },
] as const

export function AdminShell({ children, className }: AdminShellProps) {
  return (
    <div className={cn("min-h-svh bg-neutral-950 text-neutral-50", className)}>
      <header className="border-b border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold text-neutral-100">
              Vouch Admin
            </Link>
            <nav aria-label="Admin navigation" className="hidden items-center gap-1 md:flex">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-neutral-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
