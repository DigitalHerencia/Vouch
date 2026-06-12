type PublicHeaderNavItem = { label: string; href: string }

type PublicHeaderProps = {
  logo?: React.ReactNode
  navItems?: readonly PublicHeaderNavItem[]
  items?: readonly PublicHeaderNavItem[]
}

import Link from "next/link"

import { LogoLockup } from "@/components/nav/logo-lockup"
import { Button } from "@/components/ui/button"
import { publicNavigationContent } from "@/content/navigation"

export const defaultPublicNavItems = [
  { label: publicNavigationContent.links.pricing, href: "/pricing" },
  { label: publicNavigationContent.links.faq, href: "/faq" },
  { label: publicNavigationContent.links.terms, href: "/legal/terms" },
  { label: publicNavigationContent.links.privacy, href: "/legal/privacy" },
] satisfies readonly PublicHeaderNavItem[]

export function PublicHeader({
  logo = <LogoLockup />,
  navItems = defaultPublicNavItems,
}: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-18 w-full border-b-3 border-neutral-400 bg-black">
      <div className="mx-auto hidden h-full w-full max-w-[var(--vouch-page-max-width)] items-center justify-between px-[var(--vouch-page-x)] md:flex">
        <Link
          href="/"
          aria-label={publicNavigationContent.labels.home}
          className="flex shrink-0 items-center"
        >
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
            <Link href="/sign-in">{publicNavigationContent.links.signIn}</Link>
          </Button>

          <Button variant="outline" size="lg" className="min-w-40 sm:min-w-44 lg:min-w-48" asChild>
            <Link href="/sign-up?return_to=/vouches/new">
              {publicNavigationContent.links.getStarted}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-[var(--vouch-page-x)] md:hidden">
        <Link
          href="/"
          aria-label={publicNavigationContent.labels.home}
          className="inline-flex items-center"
        >
          <LogoLockup />
        </Link>
      </div>
    </header>
  )
}
