import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const invitationTokenLookupSelect = {
  id: true,
  vouchId: true,
  tokenHash: true,
  recipientEmail: true,
  status: true,
  expiresAt: true,
  openedAt: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true,
  vouch: {
    select: {
      id: true,
      publicId: true,
      payerId: true,
      payeeId: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      status: true,
      label: true,
      meetingStartsAt: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
      createdAt: true,
      payer: {
        select: {
          id: true,
          email: true,
          displayName: true,
        },
      },
      paymentRecord: {
        select: {
          id: true,
          status: true,
          amountCents: true,
          currency: true,
          platformFeeCents: true,
        },
      },
    },
  },
} as const satisfies Prisma.InvitationSelect

export const invitationSummarySelect = {
  id: true,
  vouchId: true,
  recipientEmail: true,
  status: true,
  expiresAt: true,
  openedAt: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.InvitationSelect

export const invitationStatusSelect = invitationSummarySelect

export const invitedVouchSummarySelect = invitationTokenLookupSelect

export const adminInvitationSelect = {
  ...invitationSummarySelect,
  tokenHash: true,
  vouch: {
    select: {
      id: true,
      publicId: true,
      status: true,
      payerId: true,
      payeeId: true,
      amountCents: true,
      currency: true,
      meetingStartsAt: true,
      createdAt: true,
    },
  },
} as const satisfies Prisma.InvitationSelect
