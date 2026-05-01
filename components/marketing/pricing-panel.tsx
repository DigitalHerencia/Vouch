// components/marketing/pricing-panel.tsx

import { VouchEyebrow, VouchPanel, VouchStatCard } from "@/components/brand/vouch-elements"

const pricingStats = [
  {
    label: "Platform fee",
    value: "5%",
    body: "$5 minimum. Shown before payment commitment.",
  },
  {
    label: "Processing",
    value: "Stripe",
    body: "Provider fees are handled by Stripe or provider-backed flows.",
  },
  {
    label: "Release rule",
    value: "Both",
    body: "Funds release only after dual confirmation.",
  },
]

const pricingNotes = [
  {
    eyebrow: "Transparent by default",
    title: "Fees are visible before commitment.",
    body: "Vouch shows the Vouch amount, platform fee, provider fee, and total before a payer commits. No hidden release rule, no surprise outcome.",
  },
  {
    eyebrow: "Provider-backed",
    title: "Payment coordination, not custody.",
    body: "Vouch coordinates payment state through provider infrastructure. Vouch stores participant-safe references and lifecycle state, not raw card data or direct-custody balances.",
  },
  {
    eyebrow: "Deterministic outcome",
    title: "No hidden judgment layer.",
    body: "Both parties confirm presence in time, funds release. If confirmation does not complete, funds do not release.",
  },
]

export function PricingPanel() {
  return (
    <section className="mt-14 grid gap-10">
      <VouchPanel className="grid sm:grid-cols-2 lg:grid-cols-3">
        {pricingStats.map((stat) => (
          <VouchStatCard key={stat.label} {...stat} />
        ))}
      </VouchPanel>

      <section className="grid gap-8 lg:grid-cols-3">
        {pricingNotes.map((note) => (
          <article key={note.title}>
            <VouchEyebrow>{note.eyebrow}</VouchEyebrow>

            <h2 className="mt-5 font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[42px]">
              {note.title}
            </h2>

            <p className="mt-4 text-base leading-[1.35] font-semibold text-neutral-400 sm:text-lg">
              {note.body}
            </p>
          </article>
        ))}
      </section>
    </section>
  )
}
