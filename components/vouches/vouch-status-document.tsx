"use client"

import { Calendar, CreditCard, ReceiptText, ShieldCheck } from "lucide-react"

import { VouchStatusBadge } from "@/components/shared/vouch-status-badge"
import { CheckoutSharePanel } from "@/components/vouches/checkout-share-panel"
import { StatusRow } from "@/components/vouches/status-row"
import { StatusTile } from "@/components/vouches/status-tile"
import { VouchStatusTimeline } from "@/components/vouches/vouch-status-timeline"
import { vouchPageCopy } from "@/content/vouches"
import type { VouchStatusDocumentData } from "@/types/vouchTypes"

export function VouchStatusDocument({ data }: { data: VouchStatusDocumentData }) {
  const tone = data.statusTone ?? "pending"
  const copy = vouchPageCopy.detail
  const documentCopy = copy.document
  const windowPercent = Math.max(0, Math.min(100, data.countdown?.percentRemaining ?? 0))

  return (
    <article className="w-full border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
      <div className="grid gap-6 p-5 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-neutral-900 pb-5">
          <div className="min-w-0">
            <p className="w-fit border border-neutral-700 bg-neutral-950 px-3 py-1 text-[11px] leading-none font-black tracking-[0.2em] text-blue-600 uppercase">
              {documentCopy.eyebrow}
            </p>

            <h1
              id="vouch-title"
              className="mt-3 text-3xl leading-none font-black tracking-tight text-white uppercase md:text-5xl"
            >
              {data.title}
            </h1>

            <p className="mt-2 font-mono text-xs font-bold break-all text-neutral-400 uppercase">
              {data.publicId}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <VouchStatusBadge status={data.status} tone={tone} className="w-fit" />
            <p className="font-mono text-3xl leading-none font-black text-white md:text-4xl">
              {data.amountLabel}
            </p>
          </div>
        </header>

        <section
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={documentCopy.criticalStatusLabel}
        >
          <StatusTile label={copy.labels.merchant} value={data.merchantLabel} />
          <StatusTile label={copy.labels.customer} value={data.customerLabel} />
          <StatusTile label={documentCopy.paymentEyebrow} value={data.paymentStatusLabel} />
          <StatusTile label={copy.labels.expires} value={data.confirmationExpiresLabel} />
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="border-2 border-neutral-500 bg-neutral-950 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                  {documentCopy.paymentEyebrow}
                </p>
                <h2 className="mt-1 text-lg leading-none font-black uppercase">
                  {documentCopy.paymentTitle}
                </h2>
              </div>

              <CreditCard className="size-5 shrink-0 text-blue-600" />
            </div>

            <div className="grid gap-3 text-sm">
              <StatusRow label={copy.labels.customerAuthorizes} value={data.customerTotalLabel} />
              <StatusRow label={copy.labels.merchantReceives} value={data.merchantReceivesLabel} />
              <StatusRow label={copy.labels.status} value={data.paymentStatusLabel} />
              <StatusRow label={documentCopy.settlement} value={data.settlementStatusLabel} />
            </div>
          </section>

          <section className="border-2 border-neutral-500 bg-neutral-950 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                  {documentCopy.scheduleEyebrow}
                </p>
                <h2 className="mt-1 text-lg leading-none font-black uppercase">
                  {documentCopy.scheduleTitle}
                </h2>
              </div>

              <Calendar className="size-5 shrink-0 text-blue-600" />
            </div>

            <div className="grid gap-3 text-sm">
              <StatusRow label={copy.labels.appointment} value={data.appointmentLabel} />
              <StatusRow label={copy.labels.opens} value={data.confirmationOpensLabel} />
              <StatusRow label={copy.labels.expires} value={data.confirmationExpiresLabel} />
            </div>

            <div className="mt-6 border-t border-neutral-700 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black tracking-widest text-neutral-400 uppercase">
                  {documentCopy.windowStatus}
                </p>
                <p className="font-mono text-xs font-black text-white uppercase">
                  {data.countdown?.remainingLabel ?? documentCopy.pending}
                </p>
              </div>

              <div className="mt-3 h-3 border border-neutral-700 bg-black">
                <div className="h-full bg-blue-600" style={{ width: `${windowPercent}%` }} />
              </div>

              <p className="mt-3 text-xs leading-5 font-semibold text-neutral-500">
                {documentCopy.windowRule}
              </p>
            </div>
          </section>
        </div>

        {data.authorizationCheckoutUrl ? (
          <section className="border-2 border-neutral-500 bg-neutral-950 p-4 md:p-5">
            <CheckoutSharePanel
              checkoutUrl={data.authorizationCheckoutUrl}
              publicId={data.publicId}
              amountLabel={data.customerTotalLabel}
              appointmentLabel={data.appointmentLabel}
            />
          </section>
        ) : null}

        <section className="border-2 border-neutral-500 bg-black p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-neutral-700 pb-3">
            <div>
              <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                {documentCopy.timelineEyebrow}
              </p>
              <h2 className="mt-1 text-lg leading-none font-black uppercase">
                {documentCopy.timelineTitle}
              </h2>
            </div>

            <ReceiptText className="size-5 shrink-0 text-blue-600" />
          </div>

          <VouchStatusTimeline items={data.timeline} />
        </section>

        <section className="border-2 border-neutral-500 bg-neutral-950 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                {documentCopy.presenceEyebrow}
              </p>
              <h2 className="mt-1 text-lg leading-none font-black uppercase">
                {documentCopy.presenceTitle}
              </h2>
            </div>

            <ShieldCheck className="size-5 shrink-0 text-blue-600" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ConfirmationPill
              label={copy.labels.merchant}
              confirmed={data.confirmations.merchantConfirmed}
            />
            <ConfirmationPill
              label={copy.labels.customer}
              confirmed={data.confirmations.customerConfirmed}
            />
          </div>

          {data.confirmations.action ? (
            <div className="mt-4 border-t border-neutral-700 pt-4">{data.confirmations.action}</div>
          ) : null}
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
        {confirmed ? vouchPageCopy.detail.states.confirmed : vouchPageCopy.detail.states.waiting}
      </p>
    </div>
  )
}
