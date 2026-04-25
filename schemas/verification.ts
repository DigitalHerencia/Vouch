import { z } from "zod"
import {
  internalReturnToPathSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
} from "./common"

export const verificationStatusSchema = z.enum([
  "unstarted",
  "pending",
  "verified",
  "rejected",
  "requires_action",
  "expired",
])

export const verificationKindSchema = z.enum(["identity", "adult"])
export const verificationProviderSchema = z.enum(["stripe_identity"])

export const sanitizedVerificationProviderReferenceSchema = optionalTrimmedStringSchema
export const sanitizedVerificationFailureCodeSchema = optionalTrimmedStringSchema

export const verificationStartInputSchema = z.object({
  kind: verificationKindSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const verificationProviderReturnInputSchema = z.object({
  provider: verificationProviderSchema,
  sessionId: optionalTrimmedStringSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const verificationStatusUpdateInputSchema = z.object({
  userId: userIdSchema,
  identityStatus: verificationStatusSchema.optional(),
  adultStatus: verificationStatusSchema.optional(),
  providerReference: sanitizedVerificationProviderReferenceSchema,
  failureCode: sanitizedVerificationFailureCodeSchema,
})

export const verificationPageVariantSchema = z.enum([
  "start",
  "pending",
  "success",
  "rejected",
  "requires_action",
  "failed",
])