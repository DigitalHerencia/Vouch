import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const paymentCustomerReadinessSelect = {
  id: true,
  userId: true,
  provider: true,
  providerCustomerId: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentCustomerSelect

export const connectedAccountReadinessSelect = {
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
} as const satisfies Prisma.ConnectedAccountSelect

export const paymentSettingsSelect = paymentCustomerReadinessSelect
export const payoutSettingsSelect = connectedAccountReadinessSelect

export const paymentRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  status: true,
  lastErrorCode: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentRecordSelect

export const refundRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  paymentRecordId: true,
  status: true,
  reason: true,
  amountCents: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RefundRecordSelect

export const paymentStatusCardSelect = paymentRecordParticipantSummarySelect
export const refundStatusCardSelect = refundRecordParticipantSummarySelect

export const adminPaymentListItemSelect = {
  id: true,
  vouchId: true,
  provider: true,
  providerPaymentId: true,
  providerCheckoutSessionId: true,
  providerChargeId: true,
  providerTransferId: true,
  status: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  lastErrorCode: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentRecordSelect

export const adminPaymentDetailSelect = {
  ...adminPaymentListItemSelect,
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
      createdAt: true,
      updatedAt: true,
    },
  },
  refundRecord: {
    select: {
      id: true,
      providerRefundId: true,
      status: true,
      reason: true,
      amountCents: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  webhookEvents: {
    orderBy: { receivedAt: "desc" },
    take: 25,
    select: {
      id: true,
      provider: true,
      providerEventId: true,
      eventType: true,
      processed: true,
      receivedAt: true,
      processedAt: true,
      processingError: true,
    },
  },
} as const satisfies Prisma.PaymentRecordSelect

export const paymentWebhookEventListItemSelect = {
  id: true,
  provider: true,
  providerEventId: true,
  eventType: true,
  providerWebhookEventId: true,
  vouchId: true,
  paymentRecordId: true,
  refundRecordId: true,
  processed: true,
  receivedAt: true,
  processedAt: true,
  processingError: true,
} as const satisfies Prisma.PaymentWebhookEventSelect

export const paymentWebhookEventDetailSelect = {
  ...paymentWebhookEventListItemSelect,
  safeMetadata: true,
  providerWebhookEvent: {
    select: {
      id: true,
      provider: true,
      providerEventId: true,
      eventType: true,
      status: true,
      processed: true,
      receivedAt: true,
      processedAt: true,
      processingError: true,
      safeMetadata: true,
    },
  },
} as const satisfies Prisma.PaymentWebhookEventSelect
