"use client"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
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
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b-2 border-neutral-900 bg-black/78 backdrop-blur supports-[backdrop-filter]:bg-black/62",
        className
      )}
    >
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7 lg:gap-10">
          <Link href="/dashboard" className="inline-flex items-center text-neutral-50">
            <LogoLockup wordmarkClassName="h-12 sm:h-14" />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-2 md:flex">
            {appNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "vouch-label border border-transparent px-3 py-2 text-base text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-950 hover:text-white",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "border-blue-700 bg-blue-700/10 text-white"
                    : null
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="hidden h-11 rounded-none border-2 border-blue-700 bg-blue-700 px-5 text-base text-white shadow-[4px_4px_0_#0a0a0a] hover:bg-blue-600 sm:inline-flex"
            render={<Link href="/vouches/new" />}
          >
            Create Vouch
          </Button>
          <Button variant="ghost" size="icon" className="hidden rounded-none text-neutral-200 md:inline-flex">
            <Bell />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserMenu />
          <Menu className="size-6 text-neutral-100 md:hidden" />
        </div>
      </div>
    </header>
  )
}
