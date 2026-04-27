import type { VouchID, ID } from "./common"

export type PaymentProvider = "stripe"
export type VerificationProvider = "stripe_identity"

export type PaymentReadinessStatus = "not_started" | "requires_action" | "ready" | "failed"

export type PayoutReadinessStatus =
  | "not_started"
  | "requires_action"
  | "ready"
  | "restricted"
  | "failed"

export type PaymentStatus =
  | "not_started"
  | "requires_payment_method"
  | "authorized"
  | "captured"
  | "release_pending"
  | "released"
  | "refund_pending"
  | "refunded"
  | "voided"
  | "failed"

export type RefundStatus = "not_required" | "pending" | "succeeded" | "failed"

export type RefundReason =
  | "not_accepted"
  | "confirmation_incomplete"
  | "canceled_before_acceptance"
  | "payment_failure"
  | "provider_required"

export interface StartPaymentMethodSetupInput {
  returnTo?: string
}

export interface StartPayoutOnboardingInput {
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

export type PaymentFailureStage =
  | "create"
  | "accept"
  | "confirm"
  | "release"
  | "refund"
  | "webhook"
  | "unknown"
