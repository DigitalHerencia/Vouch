import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const verificationStatusSelect = {
  id: true,
  userId: true,
  identityStatus: true,
  adultStatus: true,
  paymentReadiness: true,
  payoutReadiness: true,
  providerReference: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.VerificationProfileSelect

export const identityVerificationStateSelect = {
  id: true,
  userId: true,
  identityStatus: true,
  providerReference: true,
  updatedAt: true,
} as const satisfies Prisma.VerificationProfileSelect

export const adultVerificationStateSelect = {
  id: true,
  userId: true,
  adultStatus: true,
  providerReference: true,
  updatedAt: true,
} as const satisfies Prisma.VerificationProfileSelect

export const verificationStatusCardSelect = verificationStatusSelect

export const adminVerificationSummarySelect = {
  ...verificationStatusSelect,
  user: {
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
    },
  },
} as const satisfies Prisma.VerificationProfileSelect
