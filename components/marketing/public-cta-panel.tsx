import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function PublicCtaPanel() {
  return (
    <section className="mt-10 grid gap-6 border border-neutral-700 bg-[#050706] p-7 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <h2 className="font-(family-name:--font-display) text-[38px] leading-none tracking-[0.04em] text-white uppercase">
          Back your next appointment with commitment.
        </h2>
        <p className="mt-3 max-w-165 text-[16px] leading-[1.3] font-semibold text-neutral-400">
          Create a Vouch, share the link, and let the confirmation rule handle the outcome.
        </p>
      </div>

      <Link
        href="/sign-up?return_to=/vouches/new"
        className="inline-flex h-14.5 min-w-60 items-center justify-center gap-8 bg-[#1D4ED8] px-7 font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-white uppercase hover:bg-blue-700"
      >
        Create a Vouch
        <ArrowRight className="size-5" />
      </Link>
    </section>
  )
}
