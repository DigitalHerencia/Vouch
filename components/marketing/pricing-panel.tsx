// components/marketing/pricing-panel.tsx

import { BadgeDollarSign, CheckCircle2, CreditCard, Landmark } from "lucide-react"

import { cn } from "@/lib/utils"

const paymentFlowSteps = [
  {
    number: "1",
    title: "Amount",
    body: "Set the Vouch amount before anyone commits.",
    icon: BadgeDollarSign,
  },
  {
    number: "2",
    title: "Fees",
    body: "Show platform and provider fees up front.",
    icon: CreditCard,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both parties confirm presence in the window.",
    icon: CheckCircle2,
  },
  {
    number: "4",
    title: "Release",
    body: "Provider infrastructure settles the outcome.",
    icon: Landmark,
  },
]

const pricingStats = [
  {
    label: "Platform fee",
    value: "5%",
    body: "Vouch coordination fee shown before commitment.",
  },
  {
    label: "Minimum fee",
    value: "$5",
    body: "Minimum platform fee for each Vouch.",
  },
  {
    label: "Provider fee",
    value: "Stripe",
    body: "Processing is handled through provider infrastructure.",
  },
  {
    label: "Release rule",
    value: "Both",
    body: "Dual confirmation is required before release.",
  },
]

const pricingNotes = [
  {
    eyebrow: "Transparent by default",
    title: "Fees are visible before commitment.",
    body: "The payer sees the Vouch amount, platform fee, provider fee, and total before moving forward. Pricing is part of the commitment, not a surprise after it.",
  },
  {
    eyebrow: "Provider-backed",
    title: "Payment coordination, not custody.",
    body: "Vouch coordinates the outcome through provider-backed payment infrastructure. Vouch stores participant-safe references, statuses, and lifecycle events — not raw card data, raw identity documents, or direct-custody balances.",
  },
  {
    eyebrow: "Deterministic outcome",
    title: "The rule stays simple.",
    body: "Payment does not release because someone argues better. Payment releases only when both parties confirm presence inside the window. If confirmation does not complete, funds do not release.",
  },
]

function PricingEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-3 bg-[#1D4ED8]" />
      <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase">
        {children}
      </p>
    </div>
  )
}

export function PricingFlowPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
        className
      )}
    >
      <div className="border-b border-neutral-800 px-6 py-6">
        <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
          Payment flow
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        {paymentFlowSteps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid flex-1 grid-cols-[1fr_92px] border-b border-neutral-800 sm:grid-cols-[1fr_124px]"
            >
              <div className="flex items-center gap-5 px-5 py-5 sm:gap-6 sm:px-7">
                <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-11 sm:text-lg">
                  {step.number}
                </div>

                <div>
                  <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.07em] text-white uppercase sm:text-3xl lg:text-[34px]">
                    {step.title}
                  </h2>

                  <p className="mt-2 max-w-65 text-base leading-tight font-semibold text-neutral-400 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-9 text-white sm:size-10" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#1D4ED8] px-5 py-5 text-center font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
        Both confirm = release
      </div>
    </aside>
  )
}

export function PricingPanel() {
  return (
    <section className="mt-14 grid gap-12">
      <section className="grid border border-neutral-700 bg-black/55 backdrop-blur-[2px] sm:grid-cols-2 lg:grid-cols-4">
        {pricingStats.map((stat, index) => (
          <article
            key={stat.label}
            className={[
              "min-h-40 border-neutral-800 p-6",
              index < 2 ? "border-b" : "",
              index % 2 === 0 ? "sm:border-r" : "",
              index < 3 ? "lg:border-r" : "",
              "lg:border-b-0",
            ].join(" ")}
          >
            <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase">
              {stat.label}
            </p>

            <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
              {stat.value}
            </p>

            <p className="mt-3 max-w-55 text-[15px] leading-[1.22] font-semibold text-neutral-300">
              {stat.body}
            </p>
          </article>
        ))}
      </section>

      <section className="grid divide-y divide-neutral-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {pricingNotes.map((note) => (
          <article
            key={note.title}
            className="grid min-h-84 grid-rows-[auto_112px_1fr] py-8 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
          >
            <PricingEyebrow>{note.eyebrow}</PricingEyebrow>

            <h2 className="mt-5 max-w-90 font-(family-name:--font-display) text-[34px] leading-none tracking-[0.04em] text-white uppercase sm:text-[42px]">
              {note.title}
            </h2>

            <p className="mt-5 max-w-95 text-[17px] leading-[1.35] font-semibold text-neutral-400">
              {note.body}
            </p>
          </article>
        ))}
      </section>
    </section>
  )
}
