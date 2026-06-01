import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const confirmationParticipantSummarySelect = {
  id: true,
  vouchId: true,
  status: true,
  windowOpensAt: true,
  windowClosesAt: true,
  merchantConfirmedAt: true,
  customerConfirmedAt: true,
  canCaptureAt: true,
  voidedAt: true,
  merchantCodeVerified: true,
  customerCodeVerified: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PresenceConfirmationSelect
