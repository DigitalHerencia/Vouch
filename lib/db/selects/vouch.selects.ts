import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { confirmationParticipantSummarySelect } from "./confirmation.selects"
import { invitationSummarySelect } from "./invitation.selects"
import {
  paymentRecordParticipantSummarySelect,
  refundRecordParticipantSummarySelect,
} from "./payment.selects"
import { userSafeIdentitySelect } from "./user.selects"

const vouchBaseScalarsSelect = {
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
  label: true,
  appointmentStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  committedAt: true,
  sentAt: true,
  acceptedAt: true,
  authorizedAt: true,
  confirmableAt: true,
  completedAt: true,
  expiredAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export const vouchIdSelect = {
  id: true,
  publicId: true,
} as const satisfies Prisma.VouchSelect

export const vouchCardSelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  archiveStatus: true,
  currency: true,
  protectedAmountCents: true,
  customerTotalCents: true,
  appointmentStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  merchant: { select: userSafeIdentitySelect },
  customer: { select: userSafeIdentitySelect },
  paymentRecord: {
    select: {
      id: true,
      status: true,
      settlementStatus: true,
      captureBefore: true,
      lastErrorCode: true,
    },
  },
  presenceConfirmations: { select: confirmationParticipantSummarySelect },
} as const satisfies Prisma.VouchSelect

export const vouchListItemSelect = vouchCardSelect
export const merchantVouchListItemSelect = vouchCardSelect
export const customerVouchListItemSelect = vouchCardSelect

export const vouchDetailBaseSelect = {
  ...vouchBaseScalarsSelect,
  merchant: { select: userSafeIdentitySelect },
  customer: { select: userSafeIdentitySelect },
  invitation: { select: invitationSummarySelect },
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
    orderBy: { createdAt: "asc" },
  },
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecords: {
    select: refundRecordParticipantSummarySelect,
    orderBy: { createdAt: "desc" },
  },
} as const satisfies Prisma.VouchSelect

export const vouchDetailForParticipantSelect = vouchDetailBaseSelect
export const vouchDetailCommittedSelect = vouchDetailBaseSelect
export const vouchDetailSentSelect = vouchDetailBaseSelect
export const vouchDetailAcceptedSelect = vouchDetailBaseSelect
export const vouchDetailAuthorizedSelect = vouchDetailBaseSelect
export const vouchDetailConfirmableSelect = vouchDetailBaseSelect
export const vouchDetailCompletedSelect = vouchDetailBaseSelect
export const vouchDetailExpiredSelect = vouchDetailBaseSelect
export const vouchDetailProviderFailureSelect = vouchDetailBaseSelect

export const vouchConfirmationStateSelect = {
  id: true,
  merchantId: true,
  customerId: true,
  status: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
  },
  paymentRecord: {
    select: {
      id: true,
      status: true,
      settlementStatus: true,
      captureBefore: true,
      amountCapturableCents: true,
    },
  },
} as const satisfies Prisma.VouchSelect

export const vouchWindowSummarySelect = {
  id: true,
  status: true,
  appointmentStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  committedAt: true,
  sentAt: true,
  acceptedAt: true,
  authorizedAt: true,
  confirmableAt: true,
  completedAt: true,
  expiredAt: true,
} as const satisfies Prisma.VouchSelect

export const vouchPaymentSummarySelect = {
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
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecords: {
    select: refundRecordParticipantSummarySelect,
    orderBy: { createdAt: "desc" },
  },
} as const satisfies Prisma.VouchSelect

export const vouchTimelineSelect = {
  id: true,
  publicId: true,
  status: true,
  appointmentStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  committedAt: true,
  sentAt: true,
  acceptedAt: true,
  authorizedAt: true,
  confirmableAt: true,
  completedAt: true,
  expiredAt: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
    orderBy: { createdAt: "asc" },
  },
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecords: {
    select: refundRecordParticipantSummarySelect,
    orderBy: { createdAt: "desc" },
  },
} as const satisfies Prisma.VouchSelect

export const vouchArchiveStateSelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  archiveStatus: true,
  completedAt: true,
  expiredAt: true,
} as const satisfies Prisma.VouchSelect

export const vouchRecoveryStateSelect = {
  id: true,
  publicId: true,
  status: true,
  recoveryStatus: true,
  paymentRecord: {
    select: {
      id: true,
      status: true,
      settlementStatus: true,
      lastErrorCode: true,
      lastErrorMessage: true,
      lastProviderSyncAt: true,
    },
  },
} as const satisfies Prisma.VouchSelect

export const whatHappensNextSelect = {
  ...vouchDetailBaseSelect,
  paymentRecord: {
    select: {
      id: true,
      status: true,
      settlementStatus: true,
      captureBefore: true,
      amountCapturableCents: true,
      lastErrorCode: true,
      lastErrorMessage: true,
    },
  },
} as const satisfies Prisma.VouchSelect

/**
 * Compatibility aliases retained for older imports during the migration.
 * These aliases must not be used to reintroduce payer/payee language.
 */
export const payerVouchListItemSelect = merchantVouchListItemSelect
export const payeeVouchListItemSelect = customerVouchListItemSelect
export const vouchDetailPendingPayerSelect = vouchDetailCommittedSelect
export const vouchDetailPendingInviteSentSelect = vouchDetailSentSelect
export const vouchDetailActiveBeforeWindowSelect = vouchDetailAuthorizedSelect
export const vouchDetailActiveWindowOpenSelect = vouchDetailConfirmableSelect
export const vouchDetailRefundedSelect = vouchDetailExpiredSelect
export const vouchDetailFailedSelect = vouchDetailProviderFailureSelect
