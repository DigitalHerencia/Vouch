import type {
  PAYMENT_STATUS_VALUES,
  PAYOUT_READINESS_STATUS_VALUES,
  REFUND_STATUS_VALUES,
} from "@/lib/vouch/constants"

export type PayoutReadinessStatus = (typeof PAYOUT_READINESS_STATUS_VALUES)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]
export type RefundStatus = (typeof REFUND_STATUS_VALUES)[number]
