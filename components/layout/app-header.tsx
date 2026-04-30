import { Bell, Menu } from "lucide-react"
import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { cn } from "@/lib/utils"

export interface AppHeaderProps {
  className?: string
}

const appNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vouches", label: "Vouches" },
  { href: "/setup", label: "Setup" },
  { href: "/settings", label: "Settings" },
] as const

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/80",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="inline-flex items-center text-neutral-50">
            <LogoLockup />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {appNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="vouch-label border-b-2 border-transparent px-1 py-5 text-sm text-neutral-200 transition hover:border-blue-700 hover:text-neutral-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vouches/new"
            className="vouch-label hidden border border-blue-700 bg-blue-700 px-4 py-2 text-sm text-neutral-100 transition hover:bg-blue-600 sm:inline-flex"
          >
            Create Vouch
          </Link>
          <Bell className="hidden size-5 text-neutral-200 md:block" />
          <UserMenu />
          <Menu className="size-6 text-neutral-100 md:hidden" />
        </div>
      </div>
    </header>
  )
}
