// components/layout/public-header.tsx

import Link from "next/link"
import { Menu } from "lucide-react"

export interface PublicHeaderProps {
  logo: React.ReactNode
}

const navItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
]

export function PublicHeader({ logo }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-21 w-full border-b border-neutral-800 bg-black">
      <div className="flex h-full w-full items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link href="/" aria-label="Vouch home" className="flex shrink-0 items-center">
          {logo}
        </Link>

        <nav className="hidden items-center gap-12 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-(family-name:--font-display) text-[13px] leading-none tracking-[0.09em] text-white uppercase transition-colors hover:text-[#1D4ED8]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href="/sign-in"
            className="font-(family-name:--font-display) text-[13px] leading-none tracking-[0.09em] text-white uppercase transition-colors hover:text-[#1D4ED8]"
          >
            Sign in
          </Link>

          <Link
            href="/sign-up?return_to=/vouches/new"
            className="inline-flex h-12 min-w-37.5 items-center justify-center bg-[#1D4ED8] px-7 text-center font-(family-name:--font-display) text-[13px] leading-none tracking-[0.09em] text-white uppercase transition-colors hover:bg-blue-700"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex size-10 items-center justify-center text-white lg:hidden"
        >
          <Menu className="size-7" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  )
}
