"use client"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"

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
] satisfies readonly TenantHeaderNavItem[]

export function TenantHeader({ navItems = defaultTenantNavItems, className }: TenantHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-21 w-full border-b border-neutral-900 bg-black",
        className,
      )}
    >
      <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 md:flex lg:px-12">
        <Link href="/dashboard" aria-label="Vouch dashboard" className="flex shrink-0 items-center">
          <LogoLockup />
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-8 lg:gap-12">
          {navItems.map((item) => (
            <Button key={item.href} variant="nav" size="nav" render={<Link href={item.href} />}>
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-5">
          <Button type="button" variant="secondary" size="icon" aria-label="Notifications">
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
