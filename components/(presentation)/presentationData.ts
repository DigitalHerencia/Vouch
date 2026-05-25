import type {
  VouchCreationDraft,
  VouchStatusDocumentData,
  VouchStatusTimelineItem,
} from "@/components/blocks/status"

export const presentationPreviewTimeline: VouchStatusTimelineItem[] = [
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

export const presentationPreviewDocument: VouchStatusDocumentData = {
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
  timeline: presentationPreviewTimeline,
  confirmations: {
    merchantConfirmed: true,
    customerConfirmed: false,
  },
  audit: [
    { label: "Provider truth", value: "Stripe current state required" },
    { label: "Capture rule", value: "Both confirmations required" },
  ],
}

export const presentationPreviewInitialDraft: Partial<VouchCreationDraft> = {
  amountDollars: "850.00",
  appointmentStartsAt: "2026-05-28T14:00",
  confirmationOpensAt: "2026-05-28T13:45",
  confirmationExpiresAt: "2026-05-28T14:30",
  disclaimerAccepted: true,
}
