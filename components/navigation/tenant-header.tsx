import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { ProviderRedirectDrawer } from "@/components/vouches/provider-redirect-drawer"
import { tenantNavigationContent } from "@/content/navigation"
import { vouchPageCopy } from "@/content/vouches"
import { cn } from "@/lib/utils"

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantHeaderNavItem {
  href: string
  label: string
}

export interface TenantHeaderProps {
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  navItems?: readonly TenantHeaderNavItem[] | undefined
  className?: string | undefined
}

export const defaultTenantNavItems = [
  { href: "/dashboard", label: tenantNavigationContent.links.dashboard },
  { href: "/vouches/new", label: tenantNavigationContent.links.vouches },
] satisfies readonly TenantHeaderNavItem[]

export function TenantHeader({
  connectAction,
  paymentAction,
  navItems = defaultTenantNavItems,
  className,
}: TenantHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-21 w-full border-b border-neutral-900 bg-black",
        className
      )}
    >
      <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 md:flex lg:px-12">
        <Link
          href="/dashboard"
          aria-label={tenantNavigationContent.labels.dashboard}
          className="flex shrink-0 items-center"
        >
          <LogoLockup />
        </Link>

        <nav
          aria-label={tenantNavigationContent.labels.mainNavigation}
          className="flex items-center gap-8 lg:gap-12"
        >
          {navItems.map((item) => (
            <Button key={item.href} variant="nav" size="nav" render={<Link href={item.href} />}>
              {item.label}
            </Button>
          ))}
          <ProviderRedirectDrawer
            action={connectAction}
            label={tenantNavigationContent.links.connect}
            title={vouchPageCopy.providerRedirects.connect.title}
            consequence={vouchPageCopy.providerRedirects.connect.consequence}
            context={vouchPageCopy.providerRedirects.connect.context}
            finePrint={vouchPageCopy.providerRedirects.connect.finePrint}
          />
          <ProviderRedirectDrawer
            action={paymentAction}
            label={tenantNavigationContent.links.payment}
            title={vouchPageCopy.providerRedirects.payment.title}
            consequence={vouchPageCopy.providerRedirects.payment.consequence}
            context={vouchPageCopy.providerRedirects.payment.context}
            finePrint={vouchPageCopy.providerRedirects.payment.finePrint}
          />
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
