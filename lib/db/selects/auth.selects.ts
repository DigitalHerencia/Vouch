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
  paymentCustomer: {
    select: {
      id: true,
      paymentMethodReady: true,
      defaultPaymentMethodId: true,
      syncedAt: true,
    },
  },
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

export const activeUserGateSelect = {
  id: true,
  status: true,
} as const satisfies Prisma.UserSelect

export const contextualParticipantRoleSelect = {
  id: true,
  merchantId: true,
  customerId: true,
  status: true,
} as const satisfies Prisma.VouchSelect

export const inviteCandidateAuthSelect = {
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
