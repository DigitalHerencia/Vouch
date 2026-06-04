import { ReceiptText } from "lucide-react"

import { ConfirmationProtocolCard } from "@/components/vouches/confirmation-protocol-card"
import { StatusRow } from "@/components/vouches/status-row"
import { StatusTile } from "@/components/vouches/status-tile"
import { VouchCountdown } from "@/components/vouches/vouch-countdown"
import { VouchStatusBadge } from "@/components/vouches/vouch-status-badge"
import { VouchStatusTimeline } from "@/components/vouches/vouch-status-timeline"

export function VouchStatusDocument({ data }: { data: VouchStatusDocumentData }) {
  const tone = data.statusTone ?? "pending"

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className="grid gap-6 p-5 md:p-8">
          <header className="grid gap-5 border-b-3 border-neutral-400 pb-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                Vouch status
              </p>
              <h2 className="mt-2 leading-none font-black tracking-wide uppercase">{data.title}</h2>
              <p className="mt-3 font-mono text-lg font-bold text-neutral-400 uppercase">
                {data.publicId}
              </p>
            </div>
            <div className="grid content-start gap-3 text-left md:text-right">
              <VouchStatusBadge status={data.status} tone={tone} className="justify-center" />
              <p className="font-mono text-3xl font-black text-white">{data.amountLabel}</p>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatusTile label="Merchant" value={data.merchantLabel} />
            <StatusTile label="Customer" value={data.customerLabel} />
            <StatusTile label="Window closes" value={data.confirmationExpiresLabel} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              {data.countdown ? <VouchCountdown {...data.countdown} /> : null}
              <ConfirmationProtocolCard {...data.confirmations} />
              <section className="border-3 border-neutral-400 bg-neutral-900 p-4">
                <p className="mb-3 text-xs font-black tracking-widest text-blue-600 uppercase">
                  Payment invoice
                </p>
                <div className="grid gap-3 text-sm">
                  <StatusRow label="Customer authorizes" value={data.customerTotalLabel} />
                  <StatusRow label="Merchant receives" value={data.merchantReceivesLabel} />
                  <StatusRow label="PaymentIntent" value={data.paymentStatusLabel} />
                  <StatusRow label="Settlement" value={data.settlementStatusLabel} />
                </div>
              </section>
            </div>

            <section className="border-3 border-neutral-400 bg-black p-4">
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-neutral-400 pb-3">
                <h3 className="font-black tracking-wide uppercase">Deterministic timeline</h3>
                <ReceiptText className="size-5 text-blue-600" />
              </div>
              <VouchStatusTimeline items={data.timeline} />
            </section>
          </section>

          {data.audit?.length ? (
            <section className="grid gap-3 border-t-3 border-neutral-400 pt-6 md:grid-cols-2">
              {data.audit.map((item) => (
                <StatusTile key={item.label} label={item.label} value={item.value} />
              ))}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
