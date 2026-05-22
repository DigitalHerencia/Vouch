import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ProviderRedirectDrawer } from "@/components/vouches/provider-redirect-drawer"
import { tenantNavigationContent } from "@/content/navigation"
import { vouchPageCopy } from "@/content/vouches"

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantFooterLink {
  label: string
  href: string
}

export interface TenantFooterProps {
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  links?: readonly TenantFooterLink[] | undefined
}

export const defaultTenantFooterLinks = [
  { label: tenantNavigationContent.links.dashboard, href: "/dashboard" },
  { label: tenantNavigationContent.links.vouches, href: "/vouches/new" },
] satisfies readonly TenantFooterLink[]

export function TenantFooter({
  connectAction,
  paymentAction,
  links = defaultTenantFooterLinks,
}: TenantFooterProps) {
  return (
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
