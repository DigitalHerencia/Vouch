import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"
import { adminAuditEventDetailSelect, adminAuditListItemSelect } from "./audit.selects"
import {
  adminPaymentDetailSelect as adminPaymentRecordDetailSelect,
  adminPaymentListItemSelect,
  paymentWebhookEventDetailSelect,
  paymentWebhookEventListItemSelect,
} from "./payment.selects"
import {
  adminUserDetailSelect as adminUserRecordDetailSelect,
  adminUserListItemSelect,
} from "./user.selects"
import {
  adminVouchDetailSelect as adminVouchRecordDetailSelect,
  adminVouchFailureStateSelect,
  adminVouchListItemSelect,
} from "./vouch.selects"

export const adminDashboardSummarySelect = {
  id: true,
  publicId: true,
  status: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  meetingStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  failedAt: true,
  updatedAt: true,
  paymentRecord: {
    select: {
      id: true,
      status: true,
      lastErrorCode: true,
      updatedAt: true,
    },
  },
  refundRecord: {
    select: {
      id: true,
      status: true,
      reason: true,
      updatedAt: true,
    },
  },
} as const satisfies Prisma.VouchSelect

export const adminFailureHeavySummarySelect = adminDashboardSummarySelect

export const adminVouchListSelect = adminVouchListItemSelect
export const adminVouchDetailSelect = adminVouchRecordDetailSelect
export const adminVouchPaymentFailureSelect = adminVouchFailureStateSelect

export const adminUserListSelect = adminUserListItemSelect
export const adminUserDetailSelect = adminUserRecordDetailSelect

export const adminPaymentListSelect = adminPaymentListItemSelect
export const adminPaymentDetailSelect = adminPaymentRecordDetailSelect

export const adminWebhookEventListSelect = paymentWebhookEventListItemSelect
export const adminWebhookEventDetailSelect = paymentWebhookEventDetailSelect

export const adminAuditLogSelect = adminAuditListItemSelect
export { adminAuditEventDetailSelect }
