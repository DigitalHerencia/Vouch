"use client"

import {
  VouchCreationWizard,
  VouchCountdown,
  VouchStatusBadge,
  VouchStatusDocument,
  VouchStatusTimeline,
  type VouchCreationActionResult,
  type VouchCreationDraft,
  type VouchStatusDocumentData,
  type VouchStatusTimelineItem,
} from "@/components/blocks/status"

const previewTimeline: VouchStatusTimelineItem[] = [
  {
    id: "draft-created",
    title: "Draft created",
    description: "Merchant entered the protected amount and confirmation window.",
    timeLabel: "9:12 AM",
    state: "completed",
    meta: "draft -> committed is blocked until the fee invoice is paid.",
  },
  {
    id: "fee-invoice-paid",
    title: "Merchant fee paid",
    description: "Hosted Stripe Checkout completed for the upfront Vouch protocol fee.",
    timeLabel: "9:18 AM",
    state: "completed",
    meta: "fee_invoice_status=paid",
  },
  {
    id: "customer-authorization",
    title: "Customer authorization",
    description: "Customer authorizes the protected amount through hosted Stripe Checkout.",
    timeLabel: "Pending",
    state: "current",
    meta: "payment_status=requires_customer_action",
  },
  {
    id: "bilateral-confirmation",
    title: "Bilateral confirmation",
    description: "Both participants confirm presence inside the confirmation window.",
    state: "upcoming",
  },
]

const previewStatusDocument: VouchStatusDocumentData = {
  title: "Venue lighting install",
  publicId: "VCH-DEMO-1042",
  status: "authorized",
  statusTone: "active",
  amountLabel: "$850.00",
  merchantReceivesLabel: "$850.00",
  customerTotalLabel: "$850.00",
  merchantLabel: "Northstar Events",
  customerLabel: "Canyon Room",
  appointmentLabel: "May 28, 2026 at 2:00 PM",
  confirmationOpensLabel: "May 28, 2026 at 1:45 PM",
  confirmationExpiresLabel: "May 28, 2026 at 2:30 PM",
  paymentStatusLabel: "Authorized",
  settlementStatusLabel: "Not captured",
  countdown: {
    label: "Confirmation window",
    expiresAtLabel: "May 28, 2026 at 2:30 PM",
    remainingLabel: "32m left",
    percentRemaining: 64,
    tone: "active",
  },
  timeline: previewTimeline,
  confirmations: {
    merchantConfirmed: true,
    customerConfirmed: false,
  },
  audit: [
    { label: "Provider truth", value: "Stripe current state required" },
    { label: "Capture rule", value: "Both confirmations required" },
  ],
}

const previewInitialDraft: Partial<VouchCreationDraft> = {
  amountDollars: "850.00",
  appointmentStartsAt: "2026-05-28T14:00",
  confirmationOpensAt: "2026-05-28T13:45",
  confirmationExpiresAt: "2026-05-28T14:30",
  disclaimerAccepted: true,
}

async function previewSaveAmount(draft: VouchCreationDraft): Promise<VouchCreationActionResult> {
  const amountCents = Math.round(Number(draft.amountDollars || "0") * 100)

  return {
    ok: true,
    data: {
      amountCents,
      customerTotalCents: amountCents,
      vouchServiceFeeCents: 2500,
      processingFeeOffsetCents: 277,
    },
  }
}

async function previewSaveWindow(): Promise<VouchCreationActionResult> {
  return {
    ok: true,
    data: {
      amountCents: 85000,
      customerTotalCents: 85000,
      vouchServiceFeeCents: 2500,
      processingFeeOffsetCents: 277,
    },
  }
}

async function previewCreateVouch(): Promise<VouchCreationActionResult> {
  return {
    ok: true,
    data: {
      amountCents: 85000,
      customerTotalCents: 85000,
      vouchServiceFeeCents: 2500,
      processingFeeOffsetCents: 277,
    },
  }
}

export default function StatsSection() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <VouchCreationWizard
          initialDraft={previewInitialDraft}
          onSaveAmount={previewSaveAmount}
          onSaveWindow={previewSaveWindow}
          onCreateVouch={previewCreateVouch}
        />
        <VouchStatusDocument data={previewStatusDocument} />
        <VouchStatusTimeline items={previewTimeline} />
        <VouchCountdown
          label="Authorization hold"
          expiresAtLabel="May 28, 2026 at 2:30 PM"
          remainingLabel="32m left"
          percentRemaining={64}
          tone="active"
        />
        <div>
          <VouchStatusBadge status="authorized" tone="active" />
        </div>
      </section>
    </main>
  )
}
