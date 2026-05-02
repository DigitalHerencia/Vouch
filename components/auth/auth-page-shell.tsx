// components/auth/auth-page-shell.tsx

import Link from "next/link"
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"

import { LogoLockup } from "@/components/brand/logo-lockup"

export interface AuthPageShellProps {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
  footnote: string
}

const authPrinciples = [
  {
    icon: ShieldCheck,
    title: "Neutral by design",
    body: "Vouch follows the confirmation rule. It does not judge disputes or award funds manually.",
  },
  {
    icon: CheckCircle2,
    title: "Both confirm",
    body: "Funds release only when both parties confirm presence inside the confirmation window.",
  },
  {
    icon: CreditCard,
    title: "Provider-backed",
    body: "Payments run through provider infrastructure. Vouch coordinates outcomes, not custody.",
  },
]

export function AuthPageShell({
  children,
  eyebrow,
  title,
  description,
  footnote,
}: AuthPageShellProps) {
  return (
    <main className="min-h-dvh w-full text-white">
      <section className="grid min-h-dvh lg:grid-cols-2">
        <section className="flex min-h-dvh flex-col bg-black px-6 py-6 sm:px-10 lg:border-r lg:border-neutral-900 lg:px-14 lg:py-10">
          <header className="flex items-center justify-between">
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
              <LogoLockup />
            </Link>

            <Link
              href="/"
              className="font-(family-name:--font-display) text-sm leading-none tracking-[0.1em] text-neutral-500 uppercase underline-offset-4 transition-colors hover:text-[#1D4ED8] hover:underline sm:text-base"
            >
              Home
            </Link>
          </header>

          <div className="flex flex-1 items-center py-10 lg:py-12">
            <div className="w-full">{children}</div>
          </div>

          <footer className="border-t border-neutral-900 pt-5 font-mono text-xs leading-5 text-neutral-600">
            <span className="text-[#1D4ED8]">{eyebrow}</span>
            <span className="mx-2 text-neutral-800">/</span>
            {footnote}
          </footer>
        </section>

        <aside className="hidden min-h-dvh border-l border-neutral-900 bg-black/25 px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="flex justify-end">
            <div className="h-3 w-30 bg-[#1D4ED8]" />
          </div>

          <div className="max-w-170">
            <p className="font-(family-name:--font-display) text-lg leading-none tracking-[0.1em] text-[#1D4ED8] uppercase">
              {eyebrow}
            </p>

            <h1 className="mt-7 font-(family-name:--font-display) text-[74px] leading-[0.86] tracking-[0.015em] text-white uppercase xl:text-[96px]">
              {title}
            </h1>

            <p className="mt-7 max-w-140 text-[20px] leading-[1.35] font-semibold text-neutral-400">
              {description}
            </p>

            <div className="mt-12 grid gap-4">
              {authPrinciples.map((principle) => {
                const Icon = principle.icon

                return (
                  <article
                    key={principle.title}
                    className="grid grid-cols-[auto_1fr] gap-5 border border-neutral-800 bg-black/55 p-5 backdrop-blur-[2px]"
                  >
                    <div className="flex size-12 items-center justify-center border border-neutral-700">
                      <Icon className="size-6 text-white" strokeWidth={1.8} />
                    </div>

                    <div>
                      <h2 className="font-(family-name:--font-display) text-[24px] leading-none tracking-[0.05em] text-white uppercase">
                        {principle.title}
                      </h2>

                      <p className="mt-2 text-[15px] leading-[1.35] font-semibold text-neutral-500">
                        {principle.body}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 font-(family-name:--font-display) text-base tracking-widest text-neutral-600 uppercase">
            Commit
            <ArrowRight className="size-4 text-[#1D4ED8]" />
            Confirm
            <ArrowRight className="size-4 text-[#1D4ED8]" />
            Covered
          </div>
        </aside>
      </section>
    </main>
  )
}
