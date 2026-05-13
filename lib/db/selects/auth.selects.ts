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
  termsAcceptances: latestTermsAcceptanceArgs,
} as const

export const currentUserAuthSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  phone: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  ...authReadinessSelect,
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
  vouchId: true,
  tokenHash: true,
  recipientEmail: true,
  status: true,
  expiresAt: true,
  vouch: {
    select: {
      id: true,
      publicId: true,
      merchantId: true,
      customerId: true,
      status: true,
      archiveStatus: true,
      recoveryStatus: true,
      currency: true,
      protectedAmountCents: true,
      merchantReceivesCents: true,
      vouchServiceFeeCents: true,
      processingFeeOffsetCents: true,
      applicationFeeAmountCents: true,
      customerTotalCents: true,
      appointmentStartsAt: true,
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

/**
 * Compatibility alias retained only if old imports still exist.
 * This does not create an admin product surface.
 */
export const adminCapabilitySelect = activeUserGateSelect
