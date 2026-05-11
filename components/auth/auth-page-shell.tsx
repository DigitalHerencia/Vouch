// components/auth/auth-page-shell.tsx

import Link from "next/link"
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { CalloutPanel } from "@/components/shared/callout-panel"
import { cn } from "@/lib/utils"

export interface AuthPageShellProps {
  children: ReactNode
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
] as const

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
    <main className="h-dvh max-h-dvh min-h-dvh w-full overflow-hidden bg-black text-white">
      <section className="grid h-dvh max-h-dvh min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-2">
        <section
          className={cn(
            "flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-black px-4 py-4 sm:px-6 sm:py-5 lg:px-9 lg:py-6 xl:px-12",
            isSignup ? "lg:order-2" : "lg:order-1"
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 overflow-hidden">
            <Link href="/" aria-label="Go to Vouch home" className="inline-flex min-w-0">
              <LogoLockup />
            </Link>

            <Link
              href="/"
              className="hover:text-primary shrink-0 font-(family-name:--font-display) text-xs leading-none tracking-widest text-neutral-500 uppercase underline-offset-4 transition-colors hover:underline sm:text-sm"
            >
              Home
            </Link>
          </header>

          <div className="flex min-h-0 flex-1 items-center overflow-hidden py-3 sm:py-4 lg:py-5">
            <div className="mx-auto flex w-full max-w-md min-w-0 flex-col justify-center overflow-hidden xl:max-w-120">
              {children}
            </div>
          </div>

          <footer className="shrink-0 overflow-hidden border-t border-neutral-900 pt-3 font-mono text-[10px] leading-4 wrap-break-word text-neutral-500 sm:pt-4 sm:text-[11px] lg:text-xs lg:leading-5">
            <span className="text-primary font-bold">{eyebrow}</span>
            <span className="mx-2 text-neutral-700">/</span>
            {footnote}
          </footer>
        </section>

        <aside
          className={cn(
            "relative hidden h-dvh max-h-dvh min-h-0 min-w-0 overflow-hidden border-neutral-900 px-7 py-7 lg:flex lg:flex-col lg:justify-center xl:px-10",
            isSignup ? "lg:order-1 lg:border-r" : "lg:order-2 lg:border-l"
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(29,78,216,0.38),transparent_28%),radial-gradient(circle_at_82%_62%,rgba(29,78,216,0.26),transparent_34%),radial-gradient(circle_at_50%_38%,rgba(29,78,216,0.1),transparent_42%),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,auto,auto,72px_72px,72px_72px]"
          />

          <div className="relative z-10 max-w-155 overflow-hidden">
            <h1 className="font-(family-name:--font-display) text-[54px] leading-[0.86] tracking-[0.015em] text-white uppercase xl:text-[72px]">
              {title}
            </h1>

            <p className="mt-5 max-w-120 text-[16px] leading-[1.32] font-semibold text-neutral-300 xl:text-[18px]">
              {description}
            </p>

            <div className="mt-7 grid gap-3 xl:mt-8">
              {authPrinciples.map((principle) => (
                <CalloutPanel
                  key={principle.title}
                  icon={principle.icon}
                  title={principle.title}
                  body={principle.body}
                  className="mt-0 border-neutral-700 bg-black/70 p-4 shadow-[6px_6px_0_0_rgba(29,78,216,0.18)] [&_h3]:text-[24px] xl:[&_h3]:text-[28px] [&_p]:text-[14px] [&_p]:leading-tight xl:[&_p]:text-[15px] [&_svg]:size-8 xl:[&_svg]:size-9"
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-(family-name:--font-display) text-sm leading-none tracking-widest text-neutral-500 uppercase xl:text-base">
              Commit
              <ArrowRight className="text-primary size-4" />
              Confirm
              <ArrowRight className="text-primary size-4" />
              Covered
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
