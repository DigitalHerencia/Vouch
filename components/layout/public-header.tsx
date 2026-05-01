// components/layout/public-header.tsx

import Link from "next/link"

export interface PublicHeaderProps {
  logo: React.ReactNode
}

const navItems = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
]

const navLinkClassName =
  "font-(family-name:--font-display) text-sm leading-none tracking-[0.1em] text-white uppercase underline-offset-4 transition-colors hover:text-[#1D4ED8] hover:underline sm:text-base lg:text-lg"

const authButtonBaseClassName =
  "inline-flex h-13 items-center justify-center text-center font-(family-name:--font-display) text-sm leading-none tracking-[0.1em] uppercase transition-all sm:text-base lg:text-lg"

export function PublicHeader({ logo }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-21 w-full border-b border-neutral-900 bg-black">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link href="/" aria-label="Vouch home" className="flex shrink-0 items-center">
          {logo}
        </Link>

        <nav className="hidden items-center gap-8 md:flex lg:gap-12">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={navLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex lg:gap-5">
          <Link
            href="/sign-in"
            className={`${authButtonBaseClassName} border border-transparent px-5 text-white hover:border-[#1D4ED8] hover:bg-black hover:text-[#1D4ED8] sm:px-6`}
          >
            <span className="translate-y-px">Sign in</span>
          </Link>

          <Link
            href="/sign-up?return_to=/vouches/new"
            className={`${authButtonBaseClassName} min-w-40 border border-[#1D4ED8] bg-[#1D4ED8] px-6 text-white hover:bg-white hover:text-black sm:min-w-44 lg:min-w-48`}
          >
            <span className="translate-y-px">Get started</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
