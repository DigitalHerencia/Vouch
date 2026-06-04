import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { VouchStatusBadge } from "@/components/vouches/vouch-status-badge"

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
  percentRemaining = 0,
  tone = "active",
  disabled = false,
}: InvoiceSummaryProps) {
  const clamped = Math.max(0, Math.min(100, percentRemaining))
  const content = (
    <section
      className={[
        "border-3 border-neutral-400 bg-black px-12 py-16 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_oklch(54.6%_0.245_262.881)]",
      ].join(" ")}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
          <div>
            <p className="text-xl font-black tracking-widest text-blue-600 uppercase">
              Vouch Summary
            </p>
            <h2 className="font-black text-white uppercase">{clientName}</h2>
            {vouchId ? (
              <p className="mt-2 font-mono text-sm font-bold text-neutral-400 uppercase">
                {invoiceNumber}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col justify-items-center space-y-2">
            <VouchStatusBadge status={tone} tone={tone} />
            <h3>{protectedAmountLabel ?? amountLabel ?? `$${amount.toFixed(2)}`}</h3>
          </div>
        </div>
      </div>

      <div className="grid content-between gap-4 border-3 border-neutral-400 bg-black p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
              {label}
            </p>
            <p className="mt-2 font-mono text-3xl leading-none font-black text-white uppercase">
              {remainingLabel}
            </p>
          </div>
        </div>
        <Progress value={clamped} className="h-4 shadow-none" />
        <p className="mt-3 text-xs leading-5 font-bold text-neutral-400 uppercase">
          Expires {expiresAtLabel}
        </p>
      </div>
    </section>
  )

  if (disabled) return content

  return <Link href={href}>{content}</Link>
}
