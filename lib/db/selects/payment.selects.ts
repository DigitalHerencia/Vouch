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
  status: true,
  reason: true,
  amountCents: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RefundRecordSelect
