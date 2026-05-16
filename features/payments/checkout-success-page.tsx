import Link from "next/link"

import { Button } from "@/components/ui/button"

export function CheckoutSuccessPage() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-6 py-16">
      <section className="space-y-6 border border-neutral-800 bg-neutral-950/70 p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            Payment authorized
          </p>
          <h1 className="font-(family-name:--font-display) text-[40px] leading-none tracking-[0.04em] text-white uppercase">
            Your Vouch is ready for confirmation.
          </h1>
          <p className="text-sm leading-6 text-neutral-400">
            Stripe has returned the authorization result. Vouch will use provider state and the
            bilateral confirmation window to determine the final outcome.
          </p>
        </div>
        <Button className="rounded-none bg-primary" render={<Link href="/dashboard" />}>
          Return to dashboard
        </Button>
      </section>
    </main>
  )
}
