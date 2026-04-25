import type { z } from "zod"
import type {
  verificationKindSchema,
  verificationPageVariantSchema,
  verificationProviderReturnInputSchema,
  verificationStartInputSchema,
  verificationStatusSchema,
  verificationStatusUpdateInputSchema,
} from "@/schemas/verification"

export type VerificationStatus = z.infer<typeof verificationStatusSchema>
export type VerificationKind = z.infer<typeof verificationKindSchema>
export type VerificationStartInput = z.infer<typeof verificationStartInputSchema>
export type VerificationProviderReturnInput = z.infer<typeof verificationProviderReturnInputSchema>
export type VerificationStatusUpdateInput = z.infer<typeof verificationStatusUpdateInputSchema>
export type VerificationPageVariant = z.infer<typeof verificationPageVariantSchema>