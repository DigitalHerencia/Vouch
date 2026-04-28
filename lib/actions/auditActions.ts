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

const authReadinessSelect = {
  verificationProfile: {
    select: {
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
    },
  },
  paymentCustomer: {
    select: {
      readiness: true,
      defaultPaymentMethodReady: true,
    },
  },
  connectedAccount: {
    select: {
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  },
  termsAcceptances: latestTermsAcceptanceArgs,
} as const

export const currentUserAuthSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  ...authReadinessSelect,
}
export const activeUserGateSelect = {
  id: true,
  status: true,
} as const satisfies Prisma.UserSelect

export const adminCapabilitySelect = {
  id: true,
  status: true,
  clerkUserId: true,
  email: true,
} as const satisfies Prisma.UserSelect

export const contextualParticipantRoleSelect = {
  id: true,
  payerId: true,
  payeeId: true,
  status: true,
} as const satisfies Prisma.VouchSelect

export const inviteCandidateAuthSelect = {
  id: true,
  tokenHash: true,
  recipientEmail: true,
  status: true,
  expiresAt: true,
  vouch: {
    select: {
      id: true,
      publicId: true,
      payerId: true,
      payeeId: true,
      status: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      meetingStartsAt: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  },
} as const satisfies Prisma.InvitationSelect

export const authWebhookUserSyncSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect
