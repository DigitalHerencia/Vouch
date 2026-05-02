import Link from "next/link"
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { cn } from "@/lib/utils"

export interface AuthPageShellProps {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
  footnote: string
  variant?: "signin" | "signup"
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
  variant = "signin",
}: AuthPageShellProps) {
  const isSignup = variant === "signup"

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(29,78,216,0.22),transparent_28%),radial-gradient(circle_at_80%_28%,rgba(29,78,216,0.12),transparent_26%),linear-gradient(135deg,#020617_0%,#030712_42%,#000000_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35"
      />

      <section className="relative grid min-h-dvh lg:grid-cols-2">
        <section
          className={cn(
            "flex min-h-dvh flex-col border-neutral-800 bg-black/72 px-6 py-6 backdrop-blur-sm sm:px-10 lg:px-14 lg:py-10",
            isSignup ? "lg:order-2 lg:border-l" : "lg:order-1 lg:border-r"
          )}
        >
          <header className="flex items-center justify-between">
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex">
              <LogoLockup />
            </Link>

            <Link
              href="/"
              className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-neutral-500 uppercase underline-offset-4 transition-colors hover:text-[#1D4ED8] hover:underline sm:text-base"
            >
              Home
            </Link>
          </header>

          <div className="flex flex-1 items-center py-10 lg:py-12">
            <div className="w-full">{children}</div>
          </div>

          <footer className="border-t border-neutral-800 pt-5 font-mono text-xs leading-5 text-neutral-500">
            <span className="text-[#1D4ED8]">{eyebrow}</span>
            <span className="mx-2 text-neutral-700">/</span>
            {footnote}
          </footer>
        </section>

        <aside
          className={cn(
            "hidden min-h-dvh px-10 py-10 lg:flex lg:flex-col lg:justify-center xl:px-16",
            isSignup ? "lg:order-1" : "lg:order-2"
          )}
        >
          <div className="max-w-170">
            <h1 className="font-(family-name:--font-display) text-[76px] leading-[0.86] tracking-[0.01em] text-white uppercase xl:text-[104px]">
              {title}
            </h1>

            <p className="mt-7 max-w-145 text-[20px] leading-[1.35] font-semibold text-neutral-400">
              {description}
            </p>

            <div className="mt-12 grid gap-4">
              {authPrinciples.map((principle) => {
                const Icon = principle.icon

                return (
                  <article
                    key={principle.title}
                    className="grid grid-cols-[auto_1fr] gap-5 border border-neutral-800 bg-black/65 p-5 shadow-[8px_8px_0_0_rgba(29,78,216,0.18)]"
                  >
                    <div className="flex size-12 items-center justify-center border border-neutral-700 bg-black">
                      <Icon className="size-6 text-white" strokeWidth={1.8} />
                    </div>

                    <div>
                      <h2 className="font-(family-name:--font-display) text-[24px] leading-none tracking-wider text-white uppercase">
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

            <div className="mt-8 flex items-center gap-4 font-(family-name:--font-display) text-base tracking-widest text-neutral-600 uppercase">
              Commit
              <ArrowRight className="size-4 text-[#1D4ED8]" />
              Confirm
              <ArrowRight className="size-4 text-[#1D4ED8]" />
              Covered
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
