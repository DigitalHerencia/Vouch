import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

const latestTermsAcceptanceArgs = {
  orderBy: { acceptedAt: "desc" },
  take: 1,
  select: {
    id: true,
    userId: true,
    termsVersion: true,
    acceptedAt: true,
  },
} as const

export const profileBasicsSelect = {
  id: true,
  displayName: true,
  phone: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const privateAccountInfoSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const accountStatusCardSelect = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const verificationStatusCardSelect = {
  id: true,
  verificationProfile: {
    select: {
      id: true,
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
      providerReference: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect

export const paymentReadinessCardSelect = {
  id: true,
  verificationProfile: {
    select: {
      paymentReadiness: true,
    },
  },
  paymentCustomer: {
    select: {
      id: true,
      provider: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect

export const payoutReadinessCardSelect = {
  id: true,
  verificationProfile: {
    select: {
      payoutReadiness: true,
    },
  },
  connectedAccount: {
    select: {
      id: true,
      provider: true,
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.UserSelect

export const termsStatusCardSelect = {
  id: true,
  termsAcceptances: latestTermsAcceptanceArgs,
} as const satisfies Prisma.UserSelect

export const accountSettingsSelect = {
  ...privateAccountInfoSelect,
  verificationProfile: {
    select: {
      id: true,
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
      providerReference: true,
      updatedAt: true,
    },
  },
  paymentCustomer: {
    select: {
      id: true,
      provider: true,
      updatedAt: true,
    },
  },
  connectedAccount: {
    select: {
      id: true,
      provider: true,
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      updatedAt: true,
    },
  },
  termsAcceptances: latestTermsAcceptanceArgs,
} as const satisfies Prisma.UserSelect
