import type {
  PAYMENT_FAILURE_STAGE_VALUES,
  PAYMENT_PROVIDER_VALUES,
  PAYMENT_READINESS_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  PAYOUT_READINESS_STATUS_VALUES,
  REFUND_REASON_VALUES,
  REFUND_STATUS_VALUES,
  SETTLEMENT_STATUS_VALUES,
  VERIFICATION_PROVIDER_VALUES,
} from "@/lib/vouch/constants"

import type { ID, VouchID } from "./common"

export type PaymentProvider = (typeof PAYMENT_PROVIDER_VALUES)[number]
export type VerificationProvider = (typeof VERIFICATION_PROVIDER_VALUES)[number]
export type PaymentReadinessStatus = (typeof PAYMENT_READINESS_STATUS_VALUES)[number]
export type PayoutReadinessStatus = (typeof PAYOUT_READINESS_STATUS_VALUES)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]
export type SettlementStatus = (typeof SETTLEMENT_STATUS_VALUES)[number]
export type RefundStatus = (typeof REFUND_STATUS_VALUES)[number]
export type RefundReason = (typeof REFUND_REASON_VALUES)[number]
export type PaymentFailureStage = (typeof PAYMENT_FAILURE_STAGE_VALUES)[number]

export interface StartStripePaymentManagementInput {
  returnTo?: string
}

export interface StartStripeConnectInput {
  returnTo?: string
}

export interface PaymentProviderReturnInput {
  provider: PaymentProvider
  setupSessionId?: string
  returnTo?: string
}

export interface PaymentOperationInput {
  vouchId: VouchID
  idempotencyKey?: string
}

export interface PaymentFailureInput {
  vouchId?: VouchID
  paymentRecordId?: ID
  failureStage: PaymentFailureStage
  failureCode?: string
  safeMessage?: string
}

export interface VouchPaymentSummaryDTO {
  provider: PaymentProvider
  safeProviderStatus: string
  paymentStatus: PaymentStatus
  settlementStatus: SettlementStatus
  checkoutUrl?: string
  paymentIntentReference?: string
  captureBefore?: string
  consequenceText: string
}

/**
 * Backward-compatible aliases retained only to keep Pass 4 isolated.
 * Later passes should rename action call sites to the Stripe-hosted flow names.
 */
export type StartPaymentMethodSetupInput = StartStripePaymentManagementInput
export type StartPayoutOnboardingInput = StartStripeConnectInput
