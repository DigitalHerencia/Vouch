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

export const setupChecklistSelect = {
  id: true,
  status: true,
  verificationProfile: {
    select: {
      identityStatus: true,
      adultStatus: true,
      paymentReadiness: true,
      payoutReadiness: true,
      updatedAt: true,
    },
  },
  paymentCustomer: {
    select: {
      updatedAt: true,
    },
  },
  connectedAccount: {
    select: {
      readiness: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      updatedAt: true,
    },
  },
  termsAcceptances: latestTermsAcceptanceArgs,
} as const satisfies Prisma.UserSelect

export const setupProgressSelect = setupChecklistSelect
export const createVouchSetupGateSelect = setupChecklistSelect
export const acceptVouchSetupGateSelect = setupChecklistSelect
export const confirmPresenceSetupGateSelect = setupChecklistSelect
export const accountReadinessSummarySelect = setupChecklistSelect

export const termsAcceptanceStatusSelect = {
  id: true,
  userId: true,
  termsVersion: true,
  acceptedAt: true,
} as const satisfies Prisma.TermsAcceptanceSelect
