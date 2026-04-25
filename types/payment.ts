import type { z } from "zod"
import type {
  paymentFailureInputSchema,
  paymentFailureStageSchema,
  paymentOperationInputSchema,
  paymentProviderReturnInputSchema,
  paymentProviderSchema,
  paymentReadinessStatusSchema,
  paymentStatusSchema,
  payoutReadinessStatusSchema,
  refundReasonSchema,
  refundStatusSchema,
  startPaymentMethodSetupInputSchema,
  startPayoutOnboardingInputSchema,
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
export type PaymentFailureInput = z.infer<typeof paymentFailureInputSchema>
export type PaymentFailureStage = z.infer<typeof paymentFailureStageSchema>