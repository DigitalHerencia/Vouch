import type { z } from "zod"
import type {
  authorizeVouchPaymentInputSchema,
  captureOrReleaseVouchPaymentInputSchema,
  initializeVouchPaymentInputSchema,
  paymentFailureInputSchema,
  paymentFailureStageSchema,
  paymentOperationInputSchema,
  paymentProviderReturnInputSchema,
  paymentProviderSchema,
  paymentWebhookEnvelopeSchema,
  paymentWebhookProcessInputSchema,
  paymentReadinessStatusSchema,
  paymentStatusSchema,
  payoutReadinessStatusSchema,
  refundReasonSchema,
  refundStatusSchema,
  refundOrVoidVouchPaymentInputSchema,
  startPaymentMethodSetupInputSchema,
  startPayoutOnboardingInputSchema,
  stripeWebhookHeadersSchema,
  verificationProviderSchema,
} from "@/schemas/payment"

export type PaymentProvider = z.infer<typeof paymentProviderSchema>
export type VerificationProvider = z.infer<typeof verificationProviderSchema>
export type PaymentReadinessStatus = z.infer<typeof paymentReadinessStatusSchema>
export type PayoutReadinessStatus = z.infer<typeof payoutReadinessStatusSchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type RefundStatus = z.infer<typeof refundStatusSchema>
export type RefundReason = z.infer<typeof refundReasonSchema>
export type StartPaymentMethodSetupInput = z.infer<typeof startPaymentMethodSetupInputSchema>
export type StartPayoutOnboardingInput = z.infer<typeof startPayoutOnboardingInputSchema>
export type PaymentProviderReturnInput = z.infer<typeof paymentProviderReturnInputSchema>
export type PaymentOperationInput = z.infer<typeof paymentOperationInputSchema>
export type InitializeVouchPaymentInput = z.infer<typeof initializeVouchPaymentInputSchema>
export type AuthorizeVouchPaymentInput = z.infer<typeof authorizeVouchPaymentInputSchema>
export type CaptureOrReleaseVouchPaymentInput = z.infer<
  typeof captureOrReleaseVouchPaymentInputSchema
>
export type RefundOrVoidVouchPaymentInput = z.infer<typeof refundOrVoidVouchPaymentInputSchema>
export type PaymentFailureInput = z.infer<typeof paymentFailureInputSchema>
export type PaymentFailureStage = z.infer<typeof paymentFailureStageSchema>
export type StripeWebhookHeaders = z.infer<typeof stripeWebhookHeadersSchema>
export type PaymentWebhookEnvelope = z.infer<typeof paymentWebhookEnvelopeSchema>
export type PaymentWebhookProcessInput = z.infer<typeof paymentWebhookProcessInputSchema>
