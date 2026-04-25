import { z } from "zod"
import { internalReturnToPathSchema, userIdSchema } from "./common"

export const setupRequirementSchema = z.enum([
  "account_active",
  "identity_verified",
  "adult_verified",
  "payment_ready",
  "payout_ready",
  "terms_accepted",
])

export const setupRequirementStatusSchema = z.enum([
  "complete",
  "pending",
  "requires_action",
  "blocked",
  "not_started",
  "failed",
])

export const setupActionContextSchema = z.enum([
  "create_vouch",
  "accept_vouch",
  "confirm_presence",
  "settings",
  "dashboard",
])

export const sanitizedTermsVersionSchema = z.string().trim().min(1).max(64)
export const sanitizedSetupReturnToSchema = internalReturnToPathSchema

export const setupChecklistItemStateSchema = z.object({
  requirement: setupRequirementSchema,
  status: setupRequirementStatusSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  actionLabel: z.string().min(1).max(80).optional(),
  blockedReason: z.string().min(1).max(240).optional(),
})

export const setupGateInputSchema = z.object({
  userId: userIdSchema,
  actionContext: setupActionContextSchema,
})

export const setupGateResultSchema = z.object({
  allowed: z.boolean(),
  actionContext: setupActionContextSchema,
  missingRequirements: z.array(setupRequirementSchema),
  blockedRequirements: z.array(setupRequirementSchema),
})

export const setupReturnContextSchema = z.object({
  returnTo: sanitizedSetupReturnToSchema.optional(),
  actionContext: setupActionContextSchema.optional(),
})

export const acceptTermsInputSchema = z.object({
  termsVersion: sanitizedTermsVersionSchema,
  returnTo: sanitizedSetupReturnToSchema.optional(),
})

export const setupChecklistSearchParamsSchema = z.object({
  returnTo: sanitizedSetupReturnToSchema.optional(),
  context: setupActionContextSchema.optional(),
})