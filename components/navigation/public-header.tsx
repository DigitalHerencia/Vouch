import type { ReactNode } from "react"
import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PublicHeaderNavItem {
  label: string
  href: string
}

export interface PublicHeaderProps {
  logo?: ReactNode | undefined
  navItems?: readonly PublicHeaderNavItem[] | undefined
  className?: string | undefined
}

export const defaultPublicNavItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly PublicHeaderNavItem[]

export function PublicHeader({
  logo = <LogoLockup />,
  navItems = defaultPublicNavItems,
  className,
}: PublicHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-21 w-full border-b border-neutral-900 bg-black",
        className,
      )}
    >
      <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 md:flex lg:px-12">
        <Link href="/" aria-label="Vouch home" className="flex shrink-0 items-center">
          {logo}
        </Link>

        <nav className="flex items-center gap-8 lg:gap-12">
          {navItems.map((item) => (
            <Button key={item.href} variant="nav" size="nav" render={<Link href={item.href} />}>
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-5">
          <Button variant="secondary" size="lg" render={<Link href="/sign-in" />}>
            Sign in
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="min-w-40 sm:min-w-44 lg:min-w-48"
            render={<Link href="/sign-up?return_to=/vouches/new" />}
          >
            Get started
          </Button>
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-6 md:hidden">
        <Link href="/" aria-label="Vouch home" className="inline-flex items-center">
          <LogoLockup
            className="justify-center"
            iconClassName="size-9"
            wordmarkClassName="text-[34px]"
          />
        </Link>
      </div>
    </header>
  )
}
