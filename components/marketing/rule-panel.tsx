import { CheckCircle2, LockKeyhole, RotateCcw } from "lucide-react"

const rules = [
  {
    icon: CheckCircle2,
    title: "Both confirm",
    body: "Funds release only after payer and payee confirm presence within the window.",
  },
  {
    icon: RotateCcw,
    title: "Otherwise refund",
    body: "If confirmation does not complete in time, the payment is refunded, voided, or not captured.",
  },
  {
    icon: LockKeyhole,
    title: "No arbitration",
    body: "Vouch does not decide who was right, who was late, or what happened outside the app.",
  },
]

export function RulePanel() {
  return (
    <section className="grid border border-neutral-700 bg-[#050706]">
      {rules.map((rule) => {
        const Icon = rule.icon

        return (
          <article
            key={rule.title}
            className="grid gap-4 border-b border-neutral-800 p-6 last:border-b-0 sm:grid-cols-[56px_1fr]"
          >
            <div className="flex size-12 items-center justify-center border border-neutral-700">
              <Icon className="size-7 text-[#1D4ED8]" strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase">
                {rule.title}
              </h2>
              <p className="mt-2 text-[16px] leading-[1.3] font-semibold text-neutral-400">
                {rule.body}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
