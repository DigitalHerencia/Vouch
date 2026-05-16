// components/auth/auth-callout-grid.tsx

import { CheckCircle2, CreditCard, ShieldCheck, type LucideIcon } from "lucide-react"

import { Surface } from "@/components/shared/surface"
import { authCalloutGridContent } from "@/content/auth"

type AuthCalloutIcon = (typeof authCalloutGridContent.principles)[number]["icon"]

const ICONS: Record<AuthCalloutIcon, LucideIcon> = {
  shield: ShieldCheck,
  check: CheckCircle2,
  card: CreditCard,
}

type AuthCalloutGridProps = Readonly<{
  title: string
  description: string
}>

export function AuthCalloutGrid({ title, description }: AuthCalloutGridProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(29,78,216,0.34),transparent_30rem),radial-gradient(circle_at_82%_62%,rgba(29,78,216,0.18),transparent_34rem),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,auto,72px_72px,72px_72px]"
      />

      <div className="relative z-10 flex min-h-dvh items-center px-10 py-10 xl:px-14">
        <div className="w-full max-w-155">
          <p className="vouch-label text-blue-500">{authCalloutGridContent.eyebrow}</p>

          <h1 className="mt-5 font-(family-name:--font-display) text-[60px] leading-[0.84] tracking-[0.015em] text-white uppercase xl:text-[86px]">
            {title}
          </h1>

          <p className="mt-6 max-w-125 text-[18px] leading-[1.35] font-semibold text-neutral-300">
            {description}
          </p>

          <div className="mt-8 grid gap-3">
            {authCalloutGridContent.principles.map((principle) => {
              const IconComponent = ICONS[principle.icon]

              return (
                <Surface
                  key={principle.title}
                  as="article"
                  variant="panel"
                  className="p-4 shadow-[6px_6px_0_0_rgba(29,78,216,0.16)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center border border-blue-700 bg-blue-700/15">
                      <IconComponent className="size-5 text-blue-500" strokeWidth={1.8} />
                    </div>

                    <div>
                      <h2 className="font-(family-name:--font-display) text-[22px] leading-none tracking-[0.04em] text-white uppercase">
                        {principle.title}
                      </h2>

                      <p className="mt-2 text-[14px] leading-snug font-semibold text-neutral-400">
                        {principle.body}
                      </p>
                    </div>
                  </div>
                </Surface>
              )
            })}
          </div>

          <div className="mt-9 grid grid-cols-3 border border-neutral-800 bg-black/45">
            {authCalloutGridContent.steps.map((step) => (
              <div key={step.label} className="border-r border-neutral-800 p-4 last:border-r-0">
                <p className="font-mono text-[11px] font-bold text-blue-500">{step.label}</p>

                <p className="mt-3 font-(family-name:--font-display) text-[18px] leading-none tracking-[0.08em] text-white uppercase">
                  {step.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
