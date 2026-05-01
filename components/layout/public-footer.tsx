// components/layout/public-footer.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { LogoLockup } from "@/components/brand/logo-lockup"

const footerLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
]

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-neutral-800 bg-black">
      <div className="grid w-full gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
        <div>
          <LogoLockup imageClassName="h-10 sm:h-11" />
          <p className="mt-5 max-w-170 text-[15px] leading-[1.45] font-semibold text-neutral-400">
            Commitment-backed payments for appointments and in-person agreements. Both parties
            confirm. Then funds release. Otherwise, refund or non-capture.
          </p>
        </div>

        <Link
          href="/sign-up?return_to=/vouches/new"
          className="inline-flex h-14.5 min-w-60 items-center justify-center gap-6 bg-[#1D4ED8] px-7 text-center font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-white uppercase transition-colors hover:bg-blue-700"
        >
          Create a Vouch
          <ArrowRight className="size-5" strokeWidth={1.9} />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-4 border-t border-neutral-900 px-6 py-7 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p className="font-mono text-[12px] leading-none text-neutral-600">
          © {new Date().getFullYear()} Vouch. Payment coordination, not escrow.
        </p>

        <nav className="flex flex-wrap gap-x-7 gap-y-3">
          {footerLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-(family-name:--font-display) text-[13px] leading-none tracking-[0.09em] text-neutral-500 uppercase transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
