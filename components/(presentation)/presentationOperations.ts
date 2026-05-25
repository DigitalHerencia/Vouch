"use server"

import {
  presentationPreviewDocument,
  presentationPreviewInitialDraft,
  presentationPreviewTimeline,
} from "@/components/(presentation)/presentationData"
import type {
  VouchCreationActionResult,
  VouchCreationDraft,
  VouchStatusDocumentData,
  VouchStatusTimelineItem,
} from "@/components/blocks/status"

export interface StatusPreviewPayload {
  document: VouchStatusDocumentData
  timeline: VouchStatusTimelineItem[]
  initialDraft: Partial<VouchCreationDraft>
}

export async function fetchStatusPreview(): Promise<StatusPreviewPayload> {
  // Server boundary stand-in for lib/fetchers: auth, authz, select, map, return DTO.
  return {
    document: presentationPreviewDocument,
    timeline: presentationPreviewTimeline,
    initialDraft: presentationPreviewInitialDraft,
  }
}

export async function saveStatusPreviewAmount(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  // Server boundary stand-in for schemas + lib/actions fee preview.
  const amountCents = parseAmountCents(draft.amountDollars)

  if (amountCents < 500) {
    return {
      ok: false,
      fieldErrors: { amountCents: ["Protected amount must be at least $5.00."] },
    }
  }

  return {
    ok: true,
    data: buildPreviewData(amountCents),
  }
}

export async function saveStatusPreviewWindow(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  // Server boundary stand-in for confirmation-window validation before persistence.
  if (!draft.appointmentStartsAt || !draft.confirmationOpensAt || !draft.confirmationExpiresAt) {
    return {
      ok: false,
      formError: "Appointment, confirmation open, and confirmation expiration are required.",
    }
  }

  if (new Date(draft.confirmationOpensAt) >= new Date(draft.confirmationExpiresAt)) {
    return {
      ok: false,
      fieldErrors: {
        confirmationExpiresAt: ["Confirmation expiration must be after the open time."],
      },
    }
  }

  return {
    ok: true,
    data: buildPreviewData(parseAmountCents(draft.amountDollars)),
  }
}

export async function createStatusPreviewVouch(
  draft: VouchCreationDraft
): Promise<VouchCreationActionResult> {
  // Server boundary stand-in for transaction/write -> audit -> hosted checkout URL.
  if (!draft.disclaimerAccepted) {
    return {
      ok: false,
      fieldErrors: { disclaimerAccepted: ["Acknowledge immutable creation before continuing."] },
    }
  }

  return {
    ok: true,
    data: {
      ...buildPreviewData(parseAmountCents(draft.amountDollars)),
      checkoutUrl: "/checkout/success?preview=status",
      detailPath: "/status",
    },
  }
}

function buildPreviewData(amountCents: number) {
  return {
    amountCents,
    customerTotalCents: amountCents,
    vouchServiceFeeCents: 2500,
    processingFeeOffsetCents: 277,
  }
}

function parseAmountCents(value: string) {
  const amount = Number(value.trim().replace(/[$,\s]/g, ""))

  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}
