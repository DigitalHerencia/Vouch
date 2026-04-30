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
  payerId: true,
  payeeId: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  status: true,
  label: true,
  meetingStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  acceptedAt: true,
  completedAt: true,
  expiredAt: true,
  canceledAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export const vouchIdSelect = {
  id: true,
  publicId: true,
} as const satisfies Prisma.VouchSelect

export const vouchCardSelect = {
  ...vouchBaseScalarsSelect,
  payer: { select: userSafeIdentitySelect },
  payee: { select: userSafeIdentitySelect },
  invitation: { select: invitationSummarySelect },
  presenceConfirmations: { select: confirmationParticipantSummarySelect },
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecord: { select: refundRecordParticipantSummarySelect },
} as const satisfies Prisma.VouchSelect

export const vouchListItemSelect = vouchCardSelect
export const payerVouchListItemSelect = vouchCardSelect
export const payeeVouchListItemSelect = vouchCardSelect

export const vouchDetailBaseSelect = {
  ...vouchCardSelect,
  notificationEvents: {
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      eventName: true,
      channel: true,
      status: true,
      createdAt: true,
      sentAt: true,
      failedAt: true,
    },
  },
} as const satisfies Prisma.VouchSelect

export const vouchDetailForParticipantSelect = vouchDetailBaseSelect
export const vouchDetailPendingPayerSelect = vouchDetailBaseSelect
export const vouchDetailPendingInviteSentSelect = vouchDetailBaseSelect
export const vouchDetailActiveBeforeWindowSelect = vouchDetailBaseSelect
export const vouchDetailActiveWindowOpenSelect = vouchDetailBaseSelect
export const vouchDetailCompletedSelect = vouchDetailBaseSelect
export const vouchDetailExpiredSelect = vouchDetailBaseSelect
export const vouchDetailRefundedSelect = vouchDetailBaseSelect
export const vouchDetailFailedSelect = vouchDetailBaseSelect

export const vouchConfirmationStateSelect = {
  id: true,
  payerId: true,
  payeeId: true,
  status: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
  },
} as const satisfies Prisma.VouchSelect

export const vouchWindowSummarySelect = {
  id: true,
  status: true,
  meetingStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  acceptedAt: true,
  completedAt: true,
  expiredAt: true,
} as const satisfies Prisma.VouchSelect

export const vouchPaymentSummarySelect = {
  id: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecord: { select: refundRecordParticipantSummarySelect },
} as const satisfies Prisma.VouchSelect

export const vouchTimelineSelect = {
  id: true,
  presenceConfirmations: {
    select: confirmationParticipantSummarySelect,
    orderBy: { createdAt: "asc" },
  },
  paymentRecord: { select: paymentRecordParticipantSummarySelect },
  refundRecord: { select: refundRecordParticipantSummarySelect },
} as const satisfies Prisma.VouchSelect

export const whatHappensNextSelect = vouchDetailBaseSelect

export const adminVouchListItemSelect = {
  ...vouchBaseScalarsSelect,
  payer: { select: userSafeIdentitySelect },
  payee: { select: userSafeIdentitySelect },
  paymentRecord: {
    select: {
      id: true,
      provider: true,
      providerPaymentId: true,
      providerChargeId: true,
      providerTransferId: true,
      status: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      lastErrorCode: true,
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
} as const satisfies Prisma.VouchSelect

export const adminVouchDetailSelect = {
  ...adminVouchListItemSelect,
  invitation: { select: invitationSummarySelect },
  presenceConfirmations: {
    select: {
      ...confirmationParticipantSummarySelect,
      user: { select: userSafeIdentitySelect },
    },
    orderBy: { createdAt: "asc" },
  },
  notificationEvents: {
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      eventName: true,
      channel: true,
      status: true,
      recipientUserId: true,
      errorCode: true,
      createdAt: true,
      sentAt: true,
      failedAt: true,
    },
  },
  paymentWebhookEvents: {
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
} as const satisfies Prisma.VouchSelect

export const adminVouchFailureStateSelect = adminVouchDetailSelect
