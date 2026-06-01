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

import type { DateLike, ID, ISODateTime, VouchID } from "./commonTypes"
import type { ConfirmationStateInput, VouchStatus } from "./vouchTypes"
import type { Stripe } from "stripe"
import type { vouchPaymentSummarySelect } from "@/lib/db/selects/vouch.selects"
import type { Prisma } from "@prisma/client/extension"

export type PaymentProvider = (typeof PAYMENT_PROVIDER_VALUES)[number]
export type paymentMethodReadyStatus = (typeof PAYMENT_READINESS_STATUS_VALUES)[number]
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

export type ResolutionPaymentStatus =
  | "not_started"
  | "requires_payment_method"
  | "authorized"
  | "captured"
  | "capture_pending"
  | "captured_settlement"
  | "refund_pending"
  | "refunded"
  | "canceled"
  | "failed"

export type RefundOrVoidResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  paymentStatus: ResolutionPaymentStatus
  now?: DateLike
  confirmationExpiresAt?: DateLike
}

export type StripeWebhookEvent = Stripe.Event

export type StripeWebhookVerificationResult =
  | { ok: true; event: StripeWebhookEvent }
  | { ok: false; status: 400; message: string }

type StripeV2Account = {
  id: string
}

type StripeV2AccountLink = {
  url: string
}

type StripeV2Client = {
  v2?: {
    core?: {
      accounts?: {
        create(input: unknown, options?: { idempotencyKey?: string }): Promise<StripeV2Account>
        retrieve(id: string, options?: { expand?: string[]; include?: string[] }): Promise<unknown>
      }
      accountLinks?: {
        create(input: unknown, options?: { idempotencyKey?: string }): Promise<StripeV2AccountLink>
      }
    }
  }
}

export type StripeRuntimeConfig = {
  secretKey: string
  webhookSecret: string
  publishableKey?: string
}

export type CreateStripeMerchantCreationFeeCheckoutInput = {
  vouchId: string
  merchantUserId: string
  feeAmountCents: number
  protectedAmountCents: number
  currency: string
  providerCustomerId?: string
  successUrl: string
  cancelUrl: string
  idempotencyKey: string
}

export type CreateStripePaymentMethodSetupCheckoutInput = {
  userId: string
  providerCustomerId: string
  successUrl: string
  cancelUrl: string
  idempotencyKey: string
}

type VouchPaymentRecord = Prisma.VouchGetPayload<{ select: typeof vouchPaymentSummarySelect }>

type PaymentReadRecord = Record<string, unknown> & {
  createdAt?: Date | null
  updatedAt?: Date | null
}

export type MoneyDTO = {
  cents: number
  currency: string
  display: string
}

export type PaymentRecordParticipantDTO = {
  id: string
  vouchId: string
  provider: string
  purpose: string
  status: string
  settlementStatus: string
  amountCents: number
  amount: MoneyDTO
  currency: string
  protectedAmountCents: number
  protectedAmount: MoneyDTO
  merchantReceivesCents: number
  merchantReceives: MoneyDTO
  vouchServiceFeeCents: number
  vouchServiceFee: MoneyDTO
  processingFeeOffsetCents: number
  processingFeeOffset: MoneyDTO
  applicationFeeAmountCents: number
  applicationFeeAmount: MoneyDTO
  customerTotalCents: number
  customerTotal: MoneyDTO
  amountCapturableCents: number
  amountCapturable: MoneyDTO
  captureBefore: ISODateTime | null
  authorizedAt: ISODateTime | null
  capturedAt: ISODateTime | null
  canceledAt: ISODateTime | null
  failedAt: ISODateTime | null
  lastProviderSyncAt: ISODateTime | null
  lastErrorCode?: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type RefundRecordParticipantDTO = {
  id: string
  vouchId: string
  paymentRecordId: string
  status: string
  reason: string | null
  amountCents: number
  amount: MoneyDTO
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

type PaymentRecordRecord = {
  id: string
  vouchId?: string
  provider?: string
  purpose?: string
  status: string
  settlementStatus: string
  amountCents?: number
  currency?: string
  protectedAmountCents?: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
  amountCapturableCents?: number
  captureBefore?: DateLike
  authorizedAt?: DateLike
  capturedAt?: DateLike
  canceledAt?: DateLike
  failedAt?: DateLike
  lastProviderSyncAt?: DateLike
  lastErrorCode?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

type RefundRecordRecord = {
  id: string
  vouchId: string
  paymentRecordId: string
  status: string
  reason: string | null
  amountCents: number
  currency?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export type UpsertPaymentRecordTxInput = {
  vouchId: string
  purpose: PaymentRecordPurpose
  provider?: PaymentProvider
  providerPaymentIntentId?: string | null
  providerCheckoutSessionId?: string | null
  providerChargeId?: string | null
  providerTransferId?: string | null
  status: PaymentStatus
  settlementStatus: SettlementStatus
  amountCents: number
  currency: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  amountCapturableCents?: number
  captureBefore?: Date | null
  authorizedAt?: Date | null
  capturedAt?: Date | null
  canceledAt?: Date | null
  failedAt?: Date | null
  lastProviderSyncAt?: Date
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
}

export type UpdatePaymentProviderStateTxInput = {
  paymentRecordId: string
  providerPaymentIntentId?: string | null
  providerChargeId?: string | null
  providerTransferId?: string | null
  status: PaymentStatus
  settlementStatus: SettlementStatus
  amountCapturableCents?: number
  captureBefore?: Date | null
  authorizedAt?: Date | null
  capturedAt?: Date | null
  canceledAt?: Date | null
  failedAt?: Date | null
  lastErrorCode?: string | null
  lastErrorMessage?: string | null
}

export type CreateRefundRecordTxInput = {
  vouchId: string
  paymentRecordId: string
  providerRefundId?: string | null
  status: RefundStatus
  reason: RefundReason
  amountCents: number
}

type PaymentActionResult = {
  paymentRecordId: string
  vouchId: string
  status: string
  settlementStatus: string
  redirectTo?: string
}
