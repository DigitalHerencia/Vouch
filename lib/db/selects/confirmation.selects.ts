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
  createdAt: true,
} as const satisfies Prisma.PresenceConfirmationSelect

export const confirmationStatusSelect = confirmationParticipantSummarySelect
export const aggregateConfirmationSelect = confirmationParticipantSummarySelect

export const confirmPresenceEligibilitySelect = {
  id: true,
  publicId: true,
  payerId: true,
  payeeId: true,
  status: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
  },
} as const satisfies Prisma.VouchSelect

export const adminConfirmationSelect = {
  ...confirmationParticipantSummarySelect,
  user: {
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
    },
  },
  vouch: {
    select: {
      id: true,
      publicId: true,
      status: true,
      payerId: true,
      payeeId: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  },
} as const satisfies Prisma.PresenceConfirmationSelect
