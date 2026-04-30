import Link from "next/link"
import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "../ui/button"

export function SiteHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800/90 px-5 sm:h-18 sm:px-8 md:px-10 lg:px-12">
      <Link href="/" aria-label="Vouch home">
        <LogoLockup />
      </Link>

      <nav className="hidden items-center gap-10 text-[11px] font-black tracking-[0.12em] text-neutral-300 uppercase lg:flex">
        <Link href="/how-it-works" className="transition hover:text-white">
          How it works
        </Link>
        <Link href="/pricing" className="transition hover:text-white">
          Pricing
        </Link>
        <Link href="/faq" className="transition hover:text-white">
          FAQ
        </Link>
      </nav>

      <div className="hidden items-center gap-5 lg:flex">
        <Link
          href="/sign-in"
          className="text-[11px] font-black tracking-[0.12em] text-neutral-200 uppercase transition hover:text-white"
        >
          Sign in
        </Link>

        <Button className="h-11 rounded-none border border-blue-500 bg-blue-700 px-7 text-[11px] font-black tracking-[0.08em] text-white uppercase shadow-none hover:bg-blue-600">
          <Link href="/sign-up?return_to=/vouches/new">Get started</Link>
        </Button>
      </div>
    </header>
  )
}
