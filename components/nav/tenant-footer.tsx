// components/nav/tenant-footer.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

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

export const defaultTenantFooterLinks = [
  { label: tenantNavigationContent.links.dashboard, href: "/dashboard" },
  { label: tenantNavigationContent.links.vouches, href: "/vouches/new" },
] satisfies readonly TenantFooterLink[]

export function TenantFooter({
  connectAction,
  paymentAction,
  links = defaultTenantFooterLinks,
}: TenantFooterProps) {
  const pathname = usePathname()
  const [pendingProvider, setPendingProvider] = useState<"connect" | "payment" | null>(null)
  const providerCopy = pendingProvider ? vouchPageCopy.providerRedirects[pendingProvider] : null
  const providerAction = pendingProvider === "connect" ? connectAction : paymentAction
  const returnPath = pathname === "/vouches/new" ? "/vouches/new" : "/dashboard"
  const providerActionLabel =
    pendingProvider === "payment" ? "Save payment method" : "Continue to Stripe"

  return (
    <>
      <footer className="w-full border-t-3 border-neutral-400 bg-black">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 pb-22 md:px-6 md:pb-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-sm leading-none text-neutral-400 md:text-base">
            © {new Date().getFullYear()} {tenantNavigationContent.footer.legalLine}
          </p>

          <nav
            aria-label={tenantNavigationContent.labels.footerNavigation}
            className="flex flex-wrap gap-x-5 gap-y-3 lg:gap-x-7"
          >
            {links.map((item) => (
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
        </div>
      </footer>

      <Drawer open={!!pendingProvider} onOpenChange={(open) => !open && setPendingProvider(null)}>
        <DrawerContent>
          <DrawerHeader className="gap-3 border-b border-neutral-400 px-5 pt-8 pb-5 text-left">
            <p className="text-xs leading-none font-black tracking-widest text-blue-600 uppercase">
              Secure Stripe step
            </p>
            <DrawerTitle className="text-2xl leading-tight tracking-normal normal-case md:text-3xl">
              {providerCopy?.title}
            </DrawerTitle>
            <DrawerDescription className="max-w-xl text-base leading-7 font-semibold text-neutral-200">
              {providerCopy?.consequence}
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 px-5 py-5">
            <div className="border-l-4 border-blue-600 bg-neutral-950 px-4 py-3 text-sm leading-6 font-medium text-neutral-200">
              {providerCopy?.context}
            </div>
            <p className="text-sm leading-6 font-medium text-neutral-400">
              {providerCopy?.finePrint}
            </p>
          </div>
          <DrawerFooter className="px-5 pb-5">
            <form action={providerAction}>
              <input type="hidden" name="returnPath" value={returnPath} />
              <Button type="submit" className="w-full">
                {providerActionLabel}
              </Button>
            </form>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
