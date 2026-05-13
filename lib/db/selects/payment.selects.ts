import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const paymentCustomerReadinessSelect = {
  id: true,
  userId: true,
  provider: true,
  providerCustomerId: true,
  readiness: true,
  lastProviderSyncAt: true,
  lastErrorCode: true,
  lastErrorMessage: true,
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
  lastProviderSyncAt: true,
  lastErrorCode: true,
  lastErrorMessage: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ConnectedAccountSelect

export const paymentRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  provider: true,
  providerPaymentIntentId: true,
  providerCheckoutSessionId: true,
  status: true,
  settlementStatus: true,
  amountCents: true,
  currency: true,
  protectedAmountCents: true,
  merchantReceivesCents: true,
  vouchServiceFeeCents: true,
  processingFeeOffsetCents: true,
  applicationFeeAmountCents: true,
  customerTotalCents: true,
  amountCapturableCents: true,
  captureBefore: true,
  authorizedAt: true,
  capturedAt: true,
  canceledAt: true,
  failedAt: true,
  lastProviderSyncAt: true,
  lastErrorCode: true,
  lastErrorMessage: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PaymentRecordSelect

export const refundRecordParticipantSummarySelect = {
  id: true,
  vouchId: true,
  paymentRecordId: true,
  providerRefundId: true,
  status: true,
  reason: true,
  amountCents: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RefundRecordSelect

export const paymentStatusCardSelect = paymentRecordParticipantSummarySelect
export const refundStatusCardSelect = refundRecordParticipantSummarySelect

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

/**
 * Compatibility aliases retained temporarily for older imports.
 * These do not imply settings pages exist.
 */
export const paymentSettingsSelect = paymentCustomerReadinessSelect
export const payoutSettingsSelect = connectedAccountReadinessSelect
