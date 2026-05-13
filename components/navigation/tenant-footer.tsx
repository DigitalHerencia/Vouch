import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TenantFooterLink {
  label: string
  href: string
}

export interface TenantFooterProps {
  links?: readonly TenantFooterLink[] | undefined
  className?: string | undefined
}

export const defaultTenantFooterLinks = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly TenantFooterLink[]

export function TenantFooter({ links = defaultTenantFooterLinks, className }: TenantFooterProps) {
  return (
    <footer className={cn("w-full border-t border-neutral-900 bg-black", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-7 pb-24 sm:px-10 md:pb-7 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="font-mono text-sm leading-none text-neutral-600 sm:text-base lg:text-lg">
          © {new Date().getFullYear()} Vouch. Payment coordination, not escrow.
        </p>

        <nav className="flex flex-wrap gap-x-7 gap-y-4 sm:gap-x-9">
          {links.map((item) => (
            <Button key={item.href} variant="nav" size="nav" render={<Link href={item.href} />}>
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </footer>
  )
}
