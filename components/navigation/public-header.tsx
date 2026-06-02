import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "@/components/ui/button"

export const defaultPublicNavItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly PublicHeaderNavItem[]

export function PublicHeader({
  logo = <LogoLockup />,
  navItems = defaultPublicNavItems,
}: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-21 w-full border-b border-neutral-400 bg-black">
      <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 md:flex lg:px-12">
        <Link href="/" aria-label="Vouch home" className="flex shrink-0 items-center">
          {logo}
        </Link>

        <nav className="flex items-center gap-8 lg:gap-12">
          {navItems.map((item) => (
            <Button key={item.href} variant="nav" size="nav" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-5">
          <Button variant="outline" size="lg" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>

          <Button variant="outline" size="lg" className="min-w-40 sm:min-w-44 lg:min-w-48" asChild>
            <Link href="/sign-up?return_to=/vouches/new">Get started</Link>
          </Button>
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-6 md:hidden">
        <Link href="/" aria-label="Vouch home" className="inline-flex items-center">
          <LogoLockup />
        </Link>
      </div>
    </header>
  )
}
