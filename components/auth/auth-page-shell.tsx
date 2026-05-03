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
        <main className="min-h-dvh bg-black text-white">
            <section className="grid min-h-dvh lg:grid-cols-2">
                <section
                    className={cn(
                        "flex min-h-dvh flex-col bg-black px-6 py-6 sm:px-10 lg:px-14 lg:py-10 xl:px-18",
                        isSignup ? "lg:order-2" : "lg:order-1",
                    )}
                >
                    <header className="flex items-center justify-between">
                        <Link
                            href="/"
                            aria-label="Go to Vouch home"
                            className="inline-flex"
                        >
                            <LogoLockup />
                        </Link>

                        <Link
                            href="/"
                            className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-neutral-500 uppercase underline-offset-4 transition-colors hover:text-primary hover:underline sm:text-base"
                        >
                            Home
                        </Link>
                    </header>

                    <div className="flex flex-1 items-center py-10 lg:py-12">
                        <div className="mx-auto w-full max-w-135">{children}</div>
                    </div>

                    <footer className="border-t border-neutral-900 pt-6 font-mono text-xs leading-6 text-neutral-500 sm:text-sm">
                        <span className="font-bold text-primary">{eyebrow}</span>
                        <span className="mx-2 text-neutral-700">/</span>
                        {footnote}
                    </footer>
                </section>

                <aside
                    className={cn(
                        "relative hidden min-h-dvh overflow-hidden border-neutral-900 px-10 py-10 lg:flex lg:flex-col lg:justify-center xl:px-16",
                        isSignup ? "lg:order-1 lg:border-r" : "lg:order-2 lg:border-l",
                    )}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(29,78,216,0.42),transparent_28%),radial-gradient(circle_at_82%_62%,rgba(29,78,216,0.32),transparent_34%),radial-gradient(circle_at_50%_38%,rgba(29,78,216,0.12),transparent_42%),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,auto,auto,72px_72px,72px_72px]"
                    />

                    <div className="relative z-10 max-w-180">
                        <h1 className="font-(family-name:--font-display) text-[76px] leading-[0.86] tracking-[0.015em] text-white uppercase xl:text-[104px]">
                            {title}
                        </h1>

                        <p className="mt-7 max-w-145 text-[20px] leading-[1.35] font-semibold text-neutral-300">
                            {description}
                        </p>

                        <div className="mt-12 grid gap-4">
                            {authPrinciples.map((principle) => (
                                <CalloutPanel
                                    key={principle.title}
                                    icon={principle.icon}
                                    title={principle.title}
                                    body={principle.body}
                                    className="mt-0 border-neutral-700 bg-black/70 p-5 shadow-[8px_8px_0_0_rgba(29,78,216,0.22)] sm:p-5 lg:grid-cols-[1fr]"
                                    iconClassName="size-12 border-neutral-700"
                                    titleClassName="text-[26px]"
                                    bodyClassName="text-[16px]"
                                />
                            ))}
                        </div>

                        <div className="mt-9 flex items-center gap-4 font-(family-name:--font-display) text-lg leading-none tracking-widest text-neutral-500 uppercase">
                            Commit
                            <ArrowRight className="size-5 text-primary" />
                            Confirm
                            <ArrowRight className="size-5 text-primary" />
                            Covered
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    )
}
