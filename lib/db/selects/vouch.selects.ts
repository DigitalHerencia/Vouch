import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { confirmationParticipantSummarySelect } from "./confirmation.selects"
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
  amountCents: true,
  currency: true,
  appointmentAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  status: true,
  disclaimerAcceptedAt: true,
  protocolFeePaidAt: true,
  authorizedAt: true,
  capturedAt: true,
  voidedAt: true,
  expiredAt: true,
  archived: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export const vouchCardSelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  amountCents: true,
  currency: true,
  appointmentAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  status: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
  merchant: { select: userSafeIdentitySelect },
  customer: { select: userSafeIdentitySelect },
  paymentIntents: {
    where: { purpose: "customer_deposit_authorization" },
    take: 1,
    select: paymentRecordParticipantSummarySelect,
  },
  presenceConfirmation: { select: confirmationParticipantSummarySelect },
} as const satisfies Prisma.VouchSelect

export const vouchDetailBaseSelect = {
  ...vouchBaseScalarsSelect,
  merchant: { select: userSafeIdentitySelect },
  customer: { select: userSafeIdentitySelect },
  presenceConfirmation: { select: confirmationParticipantSummarySelect },
  paymentIntents: {
    where: { purpose: "customer_deposit_authorization" },
    take: 1,
    select: paymentRecordParticipantSummarySelect,
  },
  refunds: {
    select: refundRecordParticipantSummarySelect,
    orderBy: { createdAt: "desc" },
  },
} as const satisfies Prisma.VouchSelect

export const vouchConfirmationStateSelect = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  presenceConfirmation: { select: confirmationParticipantSummarySelect },
  paymentIntents: {
    where: { purpose: "customer_deposit_authorization" },
    take: 1,
    select: {
      id: true,
      status: true,
      captureBefore: true,
    },
  },
} as const satisfies Prisma.VouchSelect

export const vouchWindowSummarySelect = {
  id: true,
  status: true,
  appointmentAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  protocolFeePaidAt: true,
  authorizedAt: true,
  capturedAt: true,
  voidedAt: true,
  expiredAt: true,
} as const satisfies Prisma.VouchSelect
