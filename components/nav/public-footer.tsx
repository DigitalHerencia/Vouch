type PublicFooterLink = { label: string; href: string }

type PublicFooterProps = { links?: readonly PublicFooterLink[] }

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { publicNavigationContent } from "@/content/navigation"

export const defaultPublicFooterLinks = [
  { label: publicNavigationContent.links.pricing, href: "/pricing" },
  { label: publicNavigationContent.links.faq, href: "/faq" },
  { label: publicNavigationContent.links.terms, href: "/legal/terms" },
  { label: publicNavigationContent.links.privacy, href: "/legal/privacy" },
] satisfies readonly PublicFooterLink[]

export function PublicFooter({ links = defaultPublicFooterLinks }: PublicFooterProps) {
  return (
    <footer className="w-full border-t-3 border-neutral-400 bg-black">
      <div className="mx-auto flex w-full max-w-[var(--vouch-page-max-width)] flex-col gap-4 px-[var(--vouch-page-x)] py-5 pb-22 md:pb-5 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm leading-none text-neutral-400 md:text-base">
          © {new Date().getFullYear()} {publicNavigationContent.footer.legalLine}
        </p>

        <nav
          aria-label={publicNavigationContent.labels.footerNavigation}
          className="flex flex-wrap gap-x-5 gap-y-3 lg:gap-x-7"
        >
          {links.map((item) => (
            <Button key={item.href} variant="link" size="nav" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </footer>
  )
}
