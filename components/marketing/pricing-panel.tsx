import { CreditCard, ShieldCheck } from "lucide-react"

const rows = [
  {
    label: "Platform fee",
    value: "5%",
    body: "$5 minimum. Shown before payment commitment.",
  },
  {
    label: "Payment processing",
    value: "Provider fee",
    body: "Processed through Stripe or provider-supported infrastructure.",
  },
  {
    label: "Release rule",
    value: "Both confirm",
    body: "Funds release only after dual confirmation within the window.",
  },
]

export function PricingPanel() {
  return (
    <section className="mt-10 grid gap-6">
      <div className="grid border border-neutral-700 bg-[#050706] lg:grid-cols-3">
        {rows.map((row) => (
          <article
            key={row.label}
            className="border-b border-neutral-800 p-6 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <p className="font-(family-name:--font-display) text-[15px] tracking-[0.08em] text-white uppercase">
              {row.label}
            </p>
            <p className="mt-5 font-(family-name:--font-display) text-[56px] leading-none tracking-[0.02em] text-white uppercase">
              {row.value}
            </p>
            <p className="mt-4 text-[16px] leading-[1.3] font-semibold text-neutral-400">
              {row.body}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 border border-neutral-700 bg-[#050706] p-6 lg:grid-cols-[auto_1fr]">
        <div className="flex size-14 items-center justify-center border border-neutral-700">
          <CreditCard className="size-7 text-[#1D4ED8]" />
        </div>
        <div>
          <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-[0.04em] text-white uppercase">
            Fees are visible before commitment.
          </h2>
          <p className="mt-3 text-[16px] leading-[1.35] font-semibold text-neutral-400">
            Vouch shows the Vouch amount, platform fee, and total before you confirm. Payment
            provider handling remains provider-backed; Vouch does not directly custody funds.
          </p>
        </div>
      </div>

      <div className="grid gap-4 border border-neutral-700 bg-[#050706] p-6 lg:grid-cols-[auto_1fr]">
        <div className="flex size-14 items-center justify-center border border-neutral-700">
          <ShieldCheck className="size-7 text-[#1D4ED8]" />
        </div>
        <div>
          <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-[0.04em] text-white uppercase">
            Simple rule. No hidden judgment.
          </h2>
          <p className="mt-3 text-[16px] leading-[1.35] font-semibold text-neutral-400">
            Both parties confirm presence in time, funds release. If confirmation does not complete,
            funds do not release.
          </p>
        </div>
      </div>
    </section>
  )
}
