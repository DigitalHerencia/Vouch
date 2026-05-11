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
  { label: "Payment setup", href: "/settings/payment" },
  { label: "Payout setup", href: "/settings/payout" },
] satisfies readonly TenantFooterLink[]

export function TenantFooter({ links = defaultTenantFooterLinks, className }: TenantFooterProps) {
  return (
    <footer className={cn("border-t border-neutral-900 bg-black/80", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 pb-24 sm:px-6 md:pb-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="font-mono text-xs font-black tracking-[0.08em] text-neutral-600 uppercase">
          Provider-backed state determines every outcome.
        </p>

        <nav className="flex flex-wrap gap-x-6 gap-y-3">
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
