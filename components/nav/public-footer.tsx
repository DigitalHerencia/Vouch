import Link from "next/link"

import { Button } from "@/components/ui/button"

export const defaultPublicFooterLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly PublicFooterLink[]

export function PublicFooter({ links = defaultPublicFooterLinks }: PublicFooterProps) {
  return (
    <footer className="w-full border-t border-neutral-400 bg-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-7 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="font-mono text-sm leading-none text-neutral-400 sm:text-base lg:text-lg">
          © {new Date().getFullYear()} Vouch. Payment coordination, not escrow.
        </p>

        <nav className="flex flex-wrap gap-x-4 gap-y-4 sm:gap-x-4">
          {links.map((item) => (
            <Button key={item.href} variant="link" size="default" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </footer>
  )
}
