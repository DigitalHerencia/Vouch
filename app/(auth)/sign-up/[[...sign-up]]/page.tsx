import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { SignupForm } from '@/features/auth/sign-up-page'
import { type SignupPageProps } from '@/types/auth.types'

export default async function SignUpPage({ searchParams }: SignupPageProps) {
    const { redirect_url: redirectUrl, return_to: returnTo } = await searchParams

    return (
        <main className="grid min-h-svh bg-neutral-950 text-neutral-50 lg:grid-cols-2">
            <section className="relative hidden overflow-hidden border-r border-neutral-800 bg-neutral-950 lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,rgba(23,23,23,1),rgba(10,10,10,1))]" />
                <div className="relative flex h-full flex-col justify-between p-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-neutral-50">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-600/15 text-blue-300">
                            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-lg font-semibold tracking-tight">Vouch</span>
                    </Link>
                    <div className="max-w-xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                            No-show protection
                        </p>
                        <h1 className="text-5xl font-semibold tracking-tight text-neutral-50">
                            Back appointments with real commitment.
                        </h1>
                        <p className="mt-6 text-base leading-7 text-neutral-300">
                            Create an account to send or accept commitment-backed payments for
                            appointments and in-person agreements.
                        </p>
                    </div>
                    <p className="max-w-lg text-sm leading-6 text-neutral-500">
                        Payment-bearing actions require account readiness, verification, payment or
                        payout setup, and current terms acceptance.
                    </p>
                </div>
            </section>

            <section className="flex items-center justify-center p-6 md:p-16">
                <div className="w-full max-w-sm">
                    <SignupForm redirectUrl={redirectUrl ?? returnTo} />
                </div>
            </section>
        </main>
    )
}
