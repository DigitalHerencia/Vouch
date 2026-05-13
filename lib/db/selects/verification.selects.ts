import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const verificationStatusSelect = {
  id: true,
  userId: true,
  identityStatus: true,
  adultStatus: true,
  provider: true,
  providerReference: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      paymentCustomer: {
        select: {
          id: true,
          readiness: true,
          provider: true,
          providerCustomerId: true,
          lastProviderSyncAt: true,
          lastErrorCode: true,
          lastErrorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      connectedAccount: {
        select: {
          id: true,
          readiness: true,
          provider: true,
          providerAccountId: true,
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
          lastProviderSyncAt: true,
          lastErrorCode: true,
          lastErrorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} as const satisfies Prisma.VerificationProfileSelect

export const identityVerificationStateSelect = {
  id: true,
  userId: true,
  identityStatus: true,
  provider: true,
  providerReference: true,
  updatedAt: true,
} as const satisfies Prisma.VerificationProfileSelect

export const adultVerificationStateSelect = {
  id: true,
  userId: true,
  adultStatus: true,
  provider: true,
  providerReference: true,
  updatedAt: true,
} as const satisfies Prisma.VerificationProfileSelect

export const verificationStatusCardSelect = verificationStatusSelect

/**
 * Compatibility alias retained only if old imports still exist.
 * Do not use this to recreate an admin product surface.
 */
export const adminVerificationSummarySelect = verificationStatusSelect
