// components/layout/public-footer.tsx

import Link from "next/link"

import { vouchTextLinkClassName } from "@/components/brand/vouch-button-styles"

const footerLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
]

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-7 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="font-mono text-sm leading-none text-neutral-600 sm:text-base lg:text-lg">
          © {new Date().getFullYear()} Vouch. Payment coordination, not escrow.
        </p>

        <nav className="flex flex-wrap gap-x-7 gap-y-4 sm:gap-x-9">
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className={vouchTextLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
