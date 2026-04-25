import { z } from "zod"

export const internalReturnToSchema = z
    .string()
    .trim()
    .startsWith("/", "Return path must be an internal path.")
    .refine((value) => !value.startsWith("//"), "Return path must be an internal path.")
    .refine((value) => !value.includes("://"), "Return path must be an internal path.")
    .optional()

export const acceptTermsSchema = z.object({
    termsVersion: z.string().trim().min(1).max(64),
    accepted: z.literal(true, {
        error: "You must accept the terms to continue.",
    }),
    returnTo: internalReturnToSchema,
})

export type AcceptTermsInput = z.infer<typeof acceptTermsSchema>

export const setupIntentSchema = z.object({
    intent: z.enum(["create", "accept", "both"]).default("both"),
    returnTo: internalReturnToSchema,
})

export type SetupIntentInput = z.infer<typeof setupIntentSchema>

export const startSetupProviderFlowSchema = z.object({
    returnTo: internalReturnToSchema,
})

export type StartSetupProviderFlowInput = z.infer<
    typeof startSetupProviderFlowSchema
>
