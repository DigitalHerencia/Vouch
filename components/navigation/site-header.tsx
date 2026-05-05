import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800/90 px-5 sm:h-18 sm:px-8 md:px-10 lg:px-12">
      <Link href="/" aria-label="Vouch home">
        <LogoLockup />
      </Link>

      <nav className="hidden items-center gap-10 text-[11px] font-black tracking-[0.12em] text-neutral-300 uppercase lg:flex">
        <Link href="/pricing" className="transition hover:text-white">
          Pricing
        </Link>
        <Link href="/faq" className="transition hover:text-white">
          FAQ
        </Link>
        <Link href="/legal/terms" className="transition hover:text-white">
          Terms
        </Link>
      </nav>

      <div className="hidden items-center gap-5 lg:flex">
        <Link
          href="/sign-in"
          className="text-[11px] font-black tracking-[0.12em] text-neutral-200 uppercase transition hover:text-white"
        >
          Sign in
        </Link>

        <Button
          variant="primary"
          size="lg"
          render={<Link href="/sign-up?return_to=/vouches/new" />}
        >
          Get started
        </Button>
      </div>
    </header>
  )
}
