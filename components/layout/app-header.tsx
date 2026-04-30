import { ShieldCheck } from "lucide-react"
import Link from "next/link"

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
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-600/15 text-blue-300">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">Vouch</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {appNavItems.map((item) => (
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

        <div className="flex items-center gap-3">
          <Link
            href="/vouches/new"
            className="hidden rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-blue-500 sm:inline-flex"
          >
            Create Vouch
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
