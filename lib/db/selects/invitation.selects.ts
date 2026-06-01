import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const invitationTokenLookupSelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  archived: true,
  amountCents: true,
  currency: true,
  appointmentAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
} as const satisfies Prisma.VouchSelect

export const invitationSummarySelect = invitationTokenLookupSelect
