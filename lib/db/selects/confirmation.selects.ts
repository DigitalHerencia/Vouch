import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const confirmationParticipantSummarySelect = {
  id: true,
  vouchId: true,
  userId: true,
  participantRole: true,
  status: true,
  method: true,
  confirmedAt: true,
  serverReceivedAt: true,
  timeBucket: true,
  clockSkewAccepted: true,
  offlinePayloadHash: true,
  createdAt: true,
} as const satisfies Prisma.PresenceConfirmationSelect

export const confirmationStatusSelect = confirmationParticipantSummarySelect
export const aggregateConfirmationSelect = confirmationParticipantSummarySelect

export const confirmPresenceEligibilitySelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
  },
  paymentRecord: {
    select: {
      id: true,
      status: true,
      settlementStatus: true,
      providerPaymentIntentId: true,
      amountCapturableCents: true,
      captureBefore: true,
    },
  },
} as const satisfies Prisma.VouchSelect
