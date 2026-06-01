// components/navigation/tenant-header.tsx
"use client"

import Link from "next/link"
import { useState } from "react"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/navigation/user-menu"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { tenantNavigationContent } from "@/content/navigation"
import { vouchPageCopy } from "@/content/vouches"

export const defaultTenantNavItems = [
  { href: "/dashboard", label: tenantNavigationContent.links.dashboard },
  { href: "/vouches/new", label: tenantNavigationContent.links.vouches },
] satisfies readonly TenantHeaderNavItem[]

export function TenantHeader({
  connectAction,
  paymentAction,
  navItems = defaultTenantNavItems,
}: TenantHeaderProps) {
  const [pendingProvider, setPendingProvider] = useState<"connect" | "payment" | null>(null)
  const providerCopy = pendingProvider ? vouchPageCopy.providerRedirects[pendingProvider] : null
  const providerAction = pendingProvider === "connect" ? connectAction : paymentAction

  return (
    <>
      <header className="sticky top-0 z-50 h-18 w-full border-b-3 border-neutral-400 bg-black">
        <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-4 md:flex md:px-6 lg:px-8">
          <Link
            href="/dashboard"
            aria-label={tenantNavigationContent.labels.dashboard}
            className="flex shrink-0 items-center"
          >
            <LogoLockup />
          </Link>

          <nav
            aria-label={tenantNavigationContent.labels.mainNavigation}
            className="flex items-center gap-5 lg:gap-7"
          >
            {navItems.map((item) => (
              <Button key={item.href} variant="link" size="nav" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button variant="link" size="nav" onClick={() => setPendingProvider("connect")}>
              {tenantNavigationContent.links.connect}
            </Button>
            <Button variant="link" size="nav" onClick={() => setPendingProvider("payment")}>
              {tenantNavigationContent.links.payment}
            </Button>
          </nav>

          <div className="flex min-w-11 items-center justify-end">
            <UserMenu />
          </div>
        </div>

        <div className="flex h-full items-center justify-center px-6 md:hidden">
          <Link
            href="/dashboard"
            aria-label={tenantNavigationContent.labels.dashboard}
            className="inline-flex items-center"
          >
            <LogoLockup />
          </Link>
        </div>
      </header>

      <Drawer open={!!pendingProvider} onOpenChange={(open) => !open && setPendingProvider(null)}>
        <DrawerContent>
          <DrawerHeader className="border-b border-neutral-400 text-left">
            <DrawerTitle>{providerCopy?.title}</DrawerTitle>
            <DrawerDescription className="font-semibold">
              {providerCopy?.consequence}
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 p-4">
            <div className="border border-neutral-400 bg-neutral-900 p-3 text-sm font-semibold text-neutral-300">
              {providerCopy?.context}
            </div>
            <p className="text-xs leading-5 font-semibold text-neutral-400">
              {providerCopy?.finePrint}
            </p>
          </div>
          <DrawerFooter>
            <form action={providerAction}>
              <Button type="submit" className="w-full">
                Continue to Stripe
              </Button>
            </form>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
