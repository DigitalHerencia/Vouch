import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const paymentCustomerReadinessSelect = {
  id: true,
  userId: true,
  stripeCustomerId: true,
  defaultPaymentMethodId: true,
  paymentMethodReady: true,
  lastSetupIntentId: true,
  lastCustomerPortalSession: true,
  lastStripeEventId: true,
  syncedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentCustomerSelect

export const connectedAccountReadinessSelect = {
  id: true,
  userId: true,
  stripeAccountId: true,
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  requirementsCurrentlyDue: true,
  requirementsEventuallyDue: true,
  disabledReason: true,
  lastAccountLinkId: true,
  lastLoginLinkId: true,
  lastStripeEventId: true,
  syncedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ConnectedAccountSelect

export const paymentRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  purpose: true,
  participantRole: true,
  stripePaymentIntentId: true,
  stripeCheckoutSessionId: true,
  stripeCustomerId: true,
  stripeAccountId: true,
  amountCents: true,
  currency: true,
  status: true,
  captureMethod: true,
  captureBefore: true,
  authorizedAt: true,
  canceledAt: true,
  failedAt: true,
  succeededAt: true,
  lastStripeEventId: true,
  syncedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentIntentRecordSelect

export const refundRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  chargeRecordId: true,
  paymentIntentRecordId: true,
  stripeRefundId: true,
  stripePaymentIntentId: true,
  stripeChargeId: true,
  amountCents: true,
  currency: true,
  reason: true,
  status: true,
  lastStripeEventId: true,
  syncedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RefundRecordSelect
