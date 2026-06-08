import { ReceiptText, ShieldCheck } from "lucide-react"

import { VouchStatusBadge } from "@/components/shared/vouch-status-badge"
import { StatusRow } from "@/components/vouches/status-row"
import { StatusTile } from "@/components/vouches/status-tile"
import { VouchStatusTimeline } from "@/components/vouches/vouch-status-timeline"
import type { VouchStatusDocumentData } from "@/types/vouchTypes"

export function VouchStatusDocument({ data }: { data: VouchStatusDocumentData }) {
  const tone = data.statusTone ?? "pending"

  return (
    <article className="w-full border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
      <div className="grid gap-5 p-4 sm:p-5 md:p-6">
        <header className="grid gap-4 border-b-3 border-neutral-400 pb-5 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
              Vouch summary
            </p>
            <h2 className="mt-2 text-2xl leading-none font-black tracking-tight text-white uppercase md:text-3xl">
              {data.title}
            </h2>
            <p className="mt-2 font-mono text-xs font-bold break-all text-neutral-400 uppercase">
              {data.publicId}
            </p>
          </div>

          <div className="grid content-start gap-2 md:justify-items-end">
            <VouchStatusBadge status={data.status} tone={tone} className="w-fit" />
            <p className="font-mono text-2xl leading-none font-black text-white md:text-3xl">
              {data.amountLabel}
            </p>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3" aria-label="Vouch summary">
          <StatusTile label="Merchant" value={data.merchantLabel} />
          <StatusTile label="Customer" value={data.customerLabel} />
          <StatusTile label="Window closes" value={data.confirmationExpiresLabel} />
        </section>

        <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="grid gap-4">
            <section className="border-2 border-neutral-500 bg-neutral-950 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                    Presence confirmation
                  </p>
                  <h3 className="mt-1 text-lg leading-none font-black uppercase">
                    Confirmation status
                  </h3>
                </div>
                <ShieldCheck className="size-5 shrink-0 text-blue-600" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ConfirmationPill
                  label="Merchant"
                  confirmed={data.confirmations.merchantConfirmed}
                />
                <ConfirmationPill
                  label="Customer"
                  confirmed={data.confirmations.customerConfirmed}
                />
              </div>

              <p className="mt-4 text-sm leading-6 font-semibold text-neutral-400">
                Both merchant and customer must confirm before the window closes.
              </p>

              {data.confirmations.action ? (
                <div className="mt-4 border-t border-neutral-700 pt-4">
                  {data.confirmations.action}
                </div>
              ) : null}
            </section>

            <section className="border-2 border-neutral-500 bg-neutral-950 p-4">
              <p className="mb-3 text-[11px] font-black tracking-widest text-blue-600 uppercase">
                Payment
              </p>
              <div className="grid gap-3 text-sm">
                <StatusRow label="Customer authorizes" value={data.customerTotalLabel} />
                <StatusRow label="Merchant receives" value={data.merchantReceivesLabel} />
                <StatusRow label="Payment status" value={data.paymentStatusLabel} />
                <StatusRow label="Settlement" value={data.settlementStatusLabel} />
              </div>
            </section>

            <section className="border-2 border-neutral-500 bg-neutral-950 p-4">
              <p className="mb-3 text-[11px] font-black tracking-widest text-blue-600 uppercase">
                Schedule
              </p>
              <div className="grid gap-3 text-sm">
                <StatusRow label="Appointment" value={data.appointmentLabel} />
                <StatusRow label="Opens" value={data.confirmationOpensLabel} />
                <StatusRow label="Expires" value={data.confirmationExpiresLabel} />
              </div>
            </section>
          </div>

          <section className="border-2 border-neutral-500 bg-black p-4">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-neutral-700 pb-3">
              <div>
                <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                  Timeline
                </p>
                <h3 className="mt-1 text-lg leading-none font-black uppercase">Next steps</h3>
              </div>
              <ReceiptText className="size-5 shrink-0 text-blue-600" />
            </div>

            <VouchStatusTimeline items={data.timeline} />
          </section>
        </section>
      </div>
    </article>
  )
}

function ConfirmationPill({ label, confirmed }: { label: string; confirmed: boolean }) {
  return (
    <div className="border border-neutral-600 bg-black p-3">
      <p className="text-[11px] font-black tracking-widest text-neutral-400 uppercase">{label}</p>
      <p className="mt-2 font-mono text-sm font-black text-white uppercase">
        {confirmed ? "Confirmed" : "Waiting"}
      </p>
    </div>
  )
}
