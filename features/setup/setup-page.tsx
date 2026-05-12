import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  FileText,
  Shield,
  UserRound,
} from "lucide-react"

import { PageHero } from "@/components/shared/page-hero"
import { Surface, SurfaceFooter, SurfaceHeader } from "@/components/shared/surface"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type SetupItem = {
  id: string
  label: string
  description: string
  complete: boolean
  actionLabel?: string
  actionHref?: string
}

type SetupPageProps = {
  title?: ReactNode
  subtitle?: string
  items: SetupItem[]
  returnTo?: string
}

const icons = [UserRound, Shield, CreditCard, Banknote, FileText]

export function SetupPage({
  title = (
    <>
      Account
      <br />
      readiness.
    </>
  ),
  subtitle = "Provider-backed setup for creating, accepting, and confirming Vouches. Complete each gate once; Vouch uses state, not stories.",
  items,
  returnTo,
}: SetupPageProps) {
  const displayItems = items.filter((item) => item.id !== "account").slice(0, 5)
  const completeCount = displayItems.filter((item) => item.complete).length
  const progress = displayItems.length ? Math.round((completeCount / displayItems.length) * 100) : 0
  const createReady = ["identity", "eligibility", "payout", "terms"].every((id) =>
    displayItems.some((item) => item.id === id && item.complete),
  )
  const acceptReady = ["identity", "eligibility", "payment", "terms"].every((id) =>
    displayItems.some((item) => item.id === id && item.complete),
  )

  return (
    <main className="grid w-full gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
      <section className="pt-2 lg:pt-8">
        <PageHero
          title={title}
          body={subtitle}
          titleClassName="max-w-140 text-[64px] sm:text-[88px] lg:text-[104px]"
          bodyClassName="max-w-125"
          actions={
            <Button
              variant="primary"
              size="cta"
              className="min-w-70 justify-between"
              render={<Link href={returnTo ?? "/dashboard"} />}
            >
              <span className="translate-y-px">Continue</span>
              <ArrowRight className="size-6" strokeWidth={1.8} />
            </Button>
          }
        />

        <div className="mt-10 grid border border-neutral-800 bg-black/55 backdrop-blur-[2px] sm:grid-cols-2">
          <ReadinessBlock label="Create Vouch" ready={createReady} />
          <ReadinessBlock label="Accept Vouch" ready={acceptReady} className="border-t border-neutral-800 sm:border-t-0 sm:border-l" />
        </div>

        <Surface className="mt-5" padding="none" variant="panel">
          <div className="grid gap-5 p-5 sm:grid-cols-[88px_1fr] sm:p-6">
            <div className="flex size-16 items-center justify-center border border-[#1D4ED8] text-[#1D4ED8] sm:size-18">
              <Shield className="size-8" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="font-(family-name:--font-display) text-3xl leading-none tracking-[0.06em] text-white uppercase sm:text-4xl">
                Why these gates?
              </h2>
              <p className="mt-3 max-w-125 text-base leading-snug font-semibold text-neutral-400">
                Verification, payment method, payout account, and terms keep every Vouch outcome
                deterministic before money-bearing flows begin.
              </p>
            </div>
          </div>
        </Surface>
      </section>

      <Surface as="aside" className="w-full lg:mt-6" variant="panel">
        <SurfaceHeader className="flex items-start justify-between gap-6 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
              Setup Gates
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-500">
              {completeCount} of {displayItems.length} provider-backed gates ready
            </p>
          </div>
          <div className="text-right">
            <p className="font-(family-name:--font-display) text-4xl leading-none tracking-[0.04em] text-white uppercase sm:text-5xl">
              {progress}%
            </p>
            <p className="vouch-label mt-2 text-xs text-neutral-500">Complete</p>
          </div>
        </SurfaceHeader>

        <div className="border-b border-neutral-800 px-5 py-5 sm:px-7">
          <Progress value={progress} className="h-2 rounded-none bg-neutral-900" />
        </div>

        <div>
          {displayItems.map((item, index) => {
            const Icon = icons[index] ?? FileText
            const StatusIcon = item.complete ? CheckCircle2 : CircleDashed

            return (
              <Link
                key={item.id}
                href={item.actionHref ?? "#"}
                className="group grid min-h-31 grid-cols-[1fr_86px] border-b border-neutral-800 last:border-b-0 hover:bg-neutral-950/85 sm:grid-cols-[1fr_112px] lg:min-h-33"
              >
                <div className="flex items-center gap-4 px-4 py-5 sm:gap-5 sm:px-6">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center border font-mono text-base font-black sm:size-11 sm:text-lg",
                      item.complete
                        ? "border-[#1D4ED8] bg-transparent text-[#1D4ED8]"
                        : "border-transparent bg-[#1D4ED8] text-white",
                    )}
                  >
                    {index + 1}
                  </div>

                  <Icon className="size-7 text-white sm:size-8" strokeWidth={1.8} />

                  <div className="min-w-0">
                    <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.06em] text-white uppercase sm:text-3xl">
                      {item.label}
                    </h2>
                    <p className="mt-2 max-w-78 text-sm leading-tight font-semibold text-neutral-400 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 border-l border-neutral-800 px-3 text-center">
                  <StatusIcon
                    className={cn("size-7", item.complete ? "text-[#1D4ED8]" : "text-neutral-500")}
                    strokeWidth={1.8}
                  />
                  <span className="vouch-label text-[11px] leading-none text-neutral-400">
                    {item.complete ? "Ready" : (item.actionLabel ?? "Pending")}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <SurfaceFooter variant="blue">Provider-backed state determines every outcome.</SurfaceFooter>
      </Surface>
    </main>
  )
}

function ReadinessBlock({
  label,
  ready,
  className,
}: {
  label: string
  ready: boolean
  className?: string | undefined
}) {
  const Icon = ready ? CheckCircle2 : CircleDashed

  return (
    <div className={cn("flex min-h-26 items-center justify-between gap-5 p-5 sm:p-6", className)}>
      <div>
        <p className="vouch-label text-xs text-neutral-500">Readiness</p>
        <p className="mt-2 font-(family-name:--font-display) text-2xl leading-none tracking-[0.06em] text-white uppercase">
          {label}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Icon className={cn("size-7", ready ? "text-[#1D4ED8]" : "text-neutral-500")} strokeWidth={1.8} />
        <span className="vouch-label text-xs text-neutral-400">{ready ? "Ready" : "Blocked"}</span>
      </div>
    </div>
  )
}
