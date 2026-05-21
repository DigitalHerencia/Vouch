// components/navigation/public-header.tsx

import type { ReactNode } from "react"
import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PresentationHeaderNavItem {
  label: string
  href: string
}

export interface PresentationHeaderProps {
  logo?: ReactNode | undefined
  navItems?: readonly PresentationHeaderNavItem[] | undefined
}

export const defaultPresentationNavItems = [
  { label: "Auth", href: "/auth-forms" },
  { label: "CTA", href: "/cta-section" },
  { label: "Error", href: "/error-pages" },
  { label: "FAQ", href: "/faq-section" },
  { label: "Feature", href: "/feature-grid" },
  { label: "Hero", href: "/hero-section" },
  { label: "Invoice", href: "/invoice" },
  { label: "Logo", href: "/logo-cloud" },
  { label: "On", href: "/onboarding-flow" },
  { label: "Settings", href: "/settings-page" },
  { label: "Stats", href: "/stats-section" },
] satisfies readonly PresentationHeaderNavItem[]

export function PresentationHeader({
  navItems = defaultPresentationNavItems,
}: PresentationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-21 border-b border-neutral-700 bg-neutral-950">
      <div className="mx-auto flex h-full w-full items-center justify-between px-4 py-3 md:px-24">
        <nav className="flex items-center gap-8 lg:gap-12">
          {navItems.map((item) => (
            <Button key={item.href} variant="default" size="default" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
