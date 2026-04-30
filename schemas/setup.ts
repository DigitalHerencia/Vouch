import { z } from "zod"

import { emptyStringToUndefined, sanitizeInternalPath } from "./common"

export const CURRENT_TERMS_VERSION = "2026-04-24"

export const internalReturnToSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .refine(
      (value) => sanitizeInternalPath(value) === value.trim(),
      "Return path must be an internal path."
    )
    .transform((value) => value.trim())
    .optional()
)

export const acceptTermsSchema = z.object({
  termsVersion: z.string().trim().min(1).max(64),
  accepted: z.literal(true, {
    error: "You must accept the terms to continue.",
  }),
  returnTo: internalReturnToSchema,
})

export type AcceptTermsInput = z.infer<typeof acceptTermsSchema>

export const setupIntentSchema = z.enum(["create", "accept", "both"])

export const setupPageStateInputSchema = z.object({
  intent: setupIntentSchema.default("both"),
  returnTo: internalReturnToSchema,
})

export type SetupIntentInput = z.infer<typeof setupPageStateInputSchema>

export const startSetupProviderFlowSchema = z.object({
  returnTo: internalReturnToSchema,
})

export type StartSetupProviderFlowInput = z.infer<typeof startSetupProviderFlowSchema>
