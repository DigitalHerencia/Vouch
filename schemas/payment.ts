import { z } from "zod"
import {
  idSchema,
  internalReturnToPathSchema,
  optionalTrimmedStringSchema,
  vouchIdSchema,
} from "./common"

export const paymentProviderSchema = z.enum(["stripe"])
export const verificationProviderSchema = z.enum(["stripe_identity"])

export const paymentReadinessStatusSchema = z.enum([
  "not_started",
  "requires_action",
  "ready",
  "failed",
])

export const payoutReadinessStatusSchema = z.enum([
  "not_started",
  "requires_action",
  "ready",
  "restricted",
  "failed",
])

export const paymentStatusSchema = z.enum([
  "not_started",
  "requires_payment_method",
  "authorized",
  "captured",
  "release_pending",
  "released",
  "refund_pending",
  "refunded",
  "voided",
  "failed",
])

export const refundStatusSchema = z.enum(["not_required", "pending", "succeeded", "failed"])

export const refundReasonSchema = z.enum([
  "not_accepted",
  "confirmation_incomplete",
  "canceled_before_acceptance",
  "payment_failure",
  "provider_required",
])

export const paymentFailureStageSchema = z.enum([
  "create",
  "accept",
  "confirm",
  "release",
  "refund",
  "webhook",
  "unknown",
])

export const sanitizedProviderReferenceSchema = optionalTrimmedStringSchema
export const sanitizedPaymentFailureCodeSchema = optionalTrimmedStringSchema
export const sanitizedSafePaymentMessageSchema = optionalTrimmedStringSchema

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9:_-]+$/)

export const startPaymentMethodSetupInputSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})

export const startPayoutOnboardingInputSchema = z.object({
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
export const captureOrReleaseVouchPaymentInputSchema = paymentOperationInputSchema
export const refundOrVoidVouchPaymentInputSchema = paymentOperationInputSchema

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
