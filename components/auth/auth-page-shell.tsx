import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"

export interface AuthPageShellProps {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
  footnote: string
}

export function AuthPageShell({
  children,
  eyebrow,
  title,
  description,
  footnote,
}: AuthPageShellProps) {
  return (
    <main className="grid h-dvh w-full overflow-hidden px-5 py-6 text-white sm:px-8 lg:px-10">
      <section className="mx-auto grid h-full w-full max-w-140 grid-rows-[auto_1fr_auto]">
        <header className="flex items-center justify-center">
          <Link href="/" aria-label="Go to Vouch home">
            <LogoLockup className="scale-90" />
          </Link>
        </header>

        <div className="flex min-h-0 items-center justify-center py-4">
          <div className="w-full">{children}</div>
        </div>

        <footer className="mx-auto max-w-md text-center font-mono text-xs leading-5 text-neutral-600">
          <span className="text-[#1D4ED8]">{eyebrow}</span>
          <span className="mx-2 text-neutral-800">/</span>
          {footnote}
        </footer>
      </section>
    </main>
  )
}
