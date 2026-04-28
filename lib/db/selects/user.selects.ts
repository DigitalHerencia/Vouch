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

const readinessRelationsSelect = {
  verificationProfile: {
    select: {
      id: true,
      userId: true,
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  paymentCustomer: {
    select: {
      id: true,
      userId: true,
      provider: true,
      providerCustomerId: true,
      readiness: true,
      defaultPaymentMethodReady: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  connectedAccount: {
    select: {
      id: true,
      userId: true,
      provider: true,
      providerAccountId: true,
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  termsAcceptances: latestTermsAcceptanceArgs,
} as const

export const userIdSelect = {
  id: true,
} as const satisfies Prisma.UserSelect

export const userAuthLookupSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  displayName: true,
  status: true,
} as const satisfies Prisma.UserSelect

export const userSessionSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const userSafeIdentitySelect = {
  id: true,
  email: true,
  displayName: true,
} as const satisfies Prisma.UserSelect

export const userPrivateAccountSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const userAccountStatusSelect = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export const userOperationalSnapshotSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  ...readinessRelationsSelect,
} as const satisfies Prisma.UserSelect

export const userWithReadinessSelect = {
  id: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  ...readinessRelationsSelect,
} as const satisfies Prisma.UserSelect

export const adminUserListItemSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  verificationProfile: {
    select: {
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
    },
  },
  paymentCustomer: {
    select: {},
  },
  connectedAccount: {
    select: {
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  },
} as const satisfies Prisma.UserSelect

export const adminUserDetailSelect = {
  ...userOperationalSnapshotSelect,
  payerVouches: {
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      publicId: true,
      status: true,
      amountCents: true,
      currency: true,
      meetingStartsAt: true,
      createdAt: true,
    },
  },
  payeeVouches: {
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      publicId: true,
      status: true,
      amountCents: true,
      currency: true,
      meetingStartsAt: true,
      createdAt: true,
    },
  },
} as const satisfies Prisma.UserSelect
