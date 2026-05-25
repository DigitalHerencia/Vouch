// components/navigation/public-header.tsx

import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

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
  { label: "Panel", href: "/process-panel" },
  { label: "On", href: "/onboarding-flow" },
  { label: "Config", href: "/configuration-page" },
  { label: "Stats", href: "/stats-section" },
] satisfies readonly PresentationHeaderNavItem[]

export function PresentationHeader({
  navItems = defaultPresentationNavItems,
}: PresentationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-21 border-b-2 border-neutral-400 bg-black">
      <div className="mx-auto ml-24 flex h-full w-full items-center px-4 py-3">
        <nav className="flex items-center gap-4 lg:gap-8">
          {navItems.map((item) => (
            <Button key={item.href} variant="outline" size="default" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
