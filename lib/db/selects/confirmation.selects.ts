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
  createdAt: true,
} as const satisfies Prisma.PresenceConfirmationSelect
