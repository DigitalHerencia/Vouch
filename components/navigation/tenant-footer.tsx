import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProviderRedirectDrawer } from "@/components/vouches/provider-redirect-drawer"
import { tenantNavigationContent } from "@/content/navigation"
import { vouchPageCopy } from "@/content/vouches"
import { cn } from "@/lib/utils"

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantFooterLink {
  label: string
  href: string
}

export interface TenantFooterProps {
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  links?: readonly TenantFooterLink[] | undefined
  className?: string | undefined
}

export const defaultTenantFooterLinks = [
  { label: tenantNavigationContent.links.dashboard, href: "/dashboard" },
  { label: tenantNavigationContent.links.vouches, href: "/vouches/new" },
] satisfies readonly TenantFooterLink[]

export function TenantFooter({
  connectAction,
  paymentAction,
  links = defaultTenantFooterLinks,
  className,
}: TenantFooterProps) {
  return (
    <footer className={cn("w-full border-t border-neutral-900 bg-black", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-7 pb-24 sm:px-10 md:pb-7 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="font-mono text-sm leading-none text-neutral-600 sm:text-base lg:text-lg">
          © {new Date().getFullYear()} {tenantNavigationContent.footer.legalLine}
        </p>

        <nav
          aria-label={tenantNavigationContent.labels.footerNavigation}
          className="flex flex-wrap gap-x-7 gap-y-4 sm:gap-x-9"
        >
          {links.map((item) => (
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
      </div>
    </footer>
  )
}
