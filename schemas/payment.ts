import { z } from "zod"

import {
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

import {
  idSchema,
  internalReturnToPathSchema,
  optionalTrimmedStringSchema,
  vouchIdSchema,
} from "./common"

export const paymentProviderSchema = z.enum(PAYMENT_PROVIDER_VALUES)
export const verificationProviderSchema = z.enum(VERIFICATION_PROVIDER_VALUES)
export const paymentReadinessStatusSchema = z.enum(PAYMENT_READINESS_STATUS_VALUES)
export const payoutReadinessStatusSchema = z.enum(PAYOUT_READINESS_STATUS_VALUES)
export const paymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES)
export const settlementStatusSchema = z.enum(SETTLEMENT_STATUS_VALUES)
export const refundStatusSchema = z.enum(REFUND_STATUS_VALUES)
export const refundReasonSchema = z.enum(REFUND_REASON_VALUES)
export const paymentFailureStageSchema = z.enum(PAYMENT_FAILURE_STAGE_VALUES)

export const sanitizedProviderReferenceSchema = optionalTrimmedStringSchema
export const sanitizedPaymentFailureCodeSchema = optionalTrimmedStringSchema
export const sanitizedSafePaymentMessageSchema = optionalTrimmedStringSchema

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9:_-]+$/)

export const startStripePaymentManagementInputSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})

export const startStripeConnectInputSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})

export const paymentProviderReturnInputSchema = z.object({
  provider: paymentProviderSchema,
  setupSessionId: optionalTrimmedStringSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const paymentOperationInputSchema = z.object({
  vouchId: vouchIdSchema,
  idempotencyKey: idempotencyKeySchema.optional(),
})

export const initializeVouchPaymentInputSchema = paymentOperationInputSchema
export const authorizeVouchPaymentInputSchema = paymentOperationInputSchema
export const captureConfirmedVouchPaymentInputSchema = paymentOperationInputSchema
export const cancelUnconfirmedVouchPaymentInputSchema = paymentOperationInputSchema
export const refundCapturedVouchPaymentInputSchema = paymentOperationInputSchema

export const paymentFailureInputSchema = z.object({
  vouchId: vouchIdSchema.optional(),
  paymentRecordId: idSchema.optional(),
  failureStage: paymentFailureStageSchema,
  failureCode: sanitizedPaymentFailureCodeSchema,
  safeMessage: sanitizedSafePaymentMessageSchema,
})

export const stripeWebhookHeadersSchema = z.object({
  "stripe-signature": z.string().min(1),
})

export const paymentWebhookEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.unknown().optional(),
})

export const paymentWebhookProcessInputSchema = z.object({
  providerEventId: z.string().min(1),
  eventType: z.string().min(1),
  idempotencyKey: idempotencyKeySchema.optional(),
})

export const paymentReadinessInputSchema = z.object({
  userId: z.string().trim().min(1).optional(),
})

/**
 * Backward-compatible aliases retained only to keep Pass 4 isolated.
 * Later passes should migrate action names away from setup/release/void wording.
 */
export const startPaymentMethodSetupInputSchema = startStripePaymentManagementInputSchema
export const startPayoutOnboardingInputSchema = startStripeConnectInputSchema
export const captureOrReleaseVouchPaymentInputSchema = captureConfirmedVouchPaymentInputSchema
export const refundOrVoidVouchPaymentInputSchema = cancelUnconfirmedVouchPaymentInputSchema
