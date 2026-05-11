"use client"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TenantHeaderNavItem {
  href: string
  label: string
}

export interface TenantHeaderProps {
  navItems?: readonly TenantHeaderNavItem[] | undefined
  className?: string | undefined
}

export const defaultTenantNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vouches", label: "Vouches" },
  { href: "/setup", label: "Setup" },
  { href: "/settings", label: "Settings" },
] satisfies readonly TenantHeaderNavItem[]

export function TenantHeader({ navItems = defaultTenantNavItems, className }: TenantHeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-19 border-b border-neutral-900 bg-black/90 backdrop-blur supports-backdrop-filter:bg-black/78",
        className,
      )}
    >
      <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 md:flex lg:px-8">
        <div className="flex items-center gap-7 lg:gap-10">
          <Link href="/dashboard" aria-label="Vouch dashboard" className="inline-flex items-center text-neutral-50">
            <LogoLockup />
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Button
                  key={item.href}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="lg" render={<Link href="/vouches/new" />}>
            Create Vouch
          </Button>

          <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
          </Button>

          <UserMenu />
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-6 md:hidden">
        <Link href="/dashboard" aria-label="Vouch dashboard" className="inline-flex items-center">
          <LogoLockup
            className="justify-center"
            iconClassName="size-9"
            wordmarkClassName="text-[34px]"
          />
        </Link>

        <Menu className="absolute right-6 size-6 text-neutral-500" aria-hidden="true" />
      </div>
    </header>
  )
}
