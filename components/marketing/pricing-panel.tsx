import { CircleCheck, CreditCard, DollarSign, Landmark } from "lucide-react"

import {
  VouchPanel,
  VouchSectionIntro,
  VouchStatGrid,
  type VouchStat,
} from "@/components/brand/vouch-elements"
import { cn } from "@/lib/utils"

const paymentFlowSteps = [
  {
    number: "1",
    title: "Amount",
    body: "The Vouch amount is set before commitment.",
    icon: DollarSign,
  },
  {
    number: "2",
    title: "Fees",
    body: "Vouch and provider fees are shown up front.",
    icon: CreditCard,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both parties confirm presence in the window.",
    icon: CircleCheck,
  },
  {
    number: "4",
    title: "Release",
    body: "Funds release through provider infrastructure.",
    icon: Landmark,
  },
]

const pricingStats: VouchStat[] = [
  {
    label: "Platform fee",
    value: "5%",
    body: "Charged by Vouch for payment coordination.",
  },
  {
    label: "Minimum fee",
    value: "$5",
    body: "Minimum Vouch platform fee per commitment.",
  },
  {
    label: "Processing",
    value: "Stripe",
    body: "Provider fees are handled by Stripe or supported provider flows.",
  },
  {
    label: "Release rule",
    value: "Both",
    body: "Funds release only after dual confirmation.",
  },
]

export function PricingFlowPanel({ className }: { className?: string }) {
  return (
    <VouchPanel className={cn("mx-auto w-full max-w-235", className)}>
      <div className="border-b border-neutral-800 p-5 sm:p-6">
        <p className="font-(family-name:--font-display) text-sm tracking-widest text-white uppercase sm:text-base">
          Payment flow
        </p>
      </div>

      <div>
        {paymentFlowSteps.map((step) => {
          const Icon = step.icon

          return (
            <article
              key={step.number}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-neutral-800 p-5 last:border-b-0 sm:gap-6 sm:p-6"
            >
              <div className="flex size-11 items-center justify-center border border-neutral-700 font-(family-name:--font-display) text-[18px] text-white">
                {step.number}
              </div>

              <div>
                <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.035em] text-white uppercase sm:text-[34px]">
                  {step.title}
                </h2>

                <p className="mt-2 max-w-105 text-[16px] leading-tight font-semibold text-neutral-400 sm:text-[18px]">
                  {step.body}
                </p>
              </div>

              <div className="hidden min-h-24 min-w-24 items-center justify-center border-l border-neutral-800 sm:flex">
                <Icon className="size-9 text-white" />
              </div>
            </article>
          )
        })}
      </div>

      <div className="bg-[#1D4ED8] px-5 py-4 text-center font-(family-name:--font-display) text-sm tracking-widest text-white uppercase sm:text-base">
        Both confirm = release
      </div>
    </VouchPanel>
  )
}

export function PricingPanel() {
  return (
    <section className="mt-12 grid gap-10">
      <VouchStatGrid stats={pricingStats} />

      <VouchSectionIntro
        eyebrow="Transparent by default"
        title="Fees are visible before commitment."
        body="Vouch shows the Vouch amount, platform fee, provider fee, and total before a payer commits. No hidden release rule, no surprise outcome."
      />

      <VouchSectionIntro
        eyebrow="Deterministic outcome"
        title="No hidden judgment layer."
        body="Both parties confirm presence in time, funds release. If confirmation does not complete, funds do not release."
      />
    </section>
  )
}
