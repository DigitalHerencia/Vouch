import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const currentUserAuthSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  connectedAccount: {
    select: {
      id: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      disabledReason: true,
      syncedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect
