import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const userIdSelect = {
  id: true,
  clerkUserId: true,
} as const satisfies Prisma.UserSelect

export const userSafeIdentitySelect = {
  id: true,
  displayName: true,
  email: true,
  status: true,
} as const satisfies Prisma.UserSelect

export const userAccountStateSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const userReadinessSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  displayName: true,
  status: true,
  verificationProfile: {
    select: {
      id: true,
      identityStatus: true,
      adultStatus: true,
      provider: true,
      providerReference: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  paymentCustomer: {
    select: {
      id: true,
      provider: true,
      providerCustomerId: true,
      readiness: true,
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
      provider: true,
      providerAccountId: true,
      readiness: true,
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
  termsAcceptances: {
    orderBy: { acceptedAt: "desc" },
    take: 5,
    select: {
      id: true,
      termsVersion: true,
      acceptedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect
