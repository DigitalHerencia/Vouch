// components/dashboard/invoice-summary.tsx

import Link from "next/link"

import { VouchStatusBadge } from "@/components/shared/vouch-status-badge"
import { Progress } from "@/components/ui/progress"
import type { InvoiceSummaryData } from "@/types/dashboardTypes"
import { dashboardContent } from "@/content/dashboard"

export type InvoiceSummaryProps = InvoiceSummaryData

const cardMotion =
  "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]"

export function InvoiceSummary({
  invoiceNumber,
  clientName,
  amount,
  amountLabel,
  href,
  vouchId,
  protectedAmountLabel,
  label,
  expiresAtLabel,
  remainingLabel,
  windowLabel,
  percentRemaining,
  tone,
  disabled = false,
}: InvoiceSummaryProps) {
  const clampedProgress = Math.max(0, Math.min(100, percentRemaining))
  const displayAmount = protectedAmountLabel ?? amountLabel ?? `$${amount.toFixed(2)}`

  const content = (
    <article
      className={[
        "border-3 border-neutral-400 bg-black px-6 py-7 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:px-8 md:py-8",
        disabled ? "pointer-events-none opacity-50" : cardMotion,
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-neutral-900 pb-5">
        <div className="min-w-0">
          <p className="text-sm font-black tracking-[0.22em] text-blue-600 uppercase">
            {dashboardContent.labels.summary}
          </p>

          <h2 className="mt-2 max-w-3xl text-3xl leading-[0.95] font-black tracking-[0.04em] text-white uppercase md:text-4xl lg:text-5xl">
            {clientName}
          </h2>

          {vouchId ? (
            <p className="mt-3 max-w-full truncate font-mono text-xs font-bold tracking-wide text-neutral-400 uppercase">
              {invoiceNumber}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <VouchStatusBadge status={tone} tone={tone} />
          <p className="text-xl leading-none font-black tracking-tight text-white md:text-2xl">
            {displayAmount}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-3 border-neutral-400 bg-black p-5 md:mt-6 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-blue-600 uppercase">
              {label}
            </p>

            <p className="mt-2 font-mono text-2xl leading-none font-black text-white uppercase md:text-3xl">
              {remainingLabel}
            </p>
          </div>

          <div className="max-w-60 text-left sm:text-right">
            <p className="text-[10px] font-black tracking-[0.22em] text-blue-600 uppercase">
              {dashboardContent.labels.window}
            </p>
            <p className="mt-1 text-xs leading-5 font-black tracking-wide text-neutral-300 uppercase">
              {windowLabel}
            </p>
          </div>
        </div>

        <Progress value={clampedProgress} className="h-3 shadow-none md:h-3.5" />

        <p className="text-[11px] leading-5 font-bold tracking-wide text-neutral-400 uppercase">
          {dashboardContent.labels.expires} {expiresAtLabel}
        </p>
      </div>
    </article>
  )

  if (disabled) return content

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  )
}
