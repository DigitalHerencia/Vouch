import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const invitationSummarySelect = {
  id: true,
  vouchId: true,
  status: true,
  expiresAt: true,
  openedAt: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.InvitationSelect

export const invitationTokenLookupSelect = {
  ...invitationSummarySelect,
  tokenHash: true,
  recipientEmail: true,
  vouch: {
    select: {
      id: true,
      publicId: true,
      merchantId: true,
      customerId: true,
      status: true,
      archiveStatus: true,
      protectedAmountCents: true,
      customerTotalCents: true,
      currency: true,
      appointmentStartsAt: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  },
} as const satisfies Prisma.InvitationSelect
