import type { z } from "zod"
import type {
  authCallbackSearchParamsSchema,
  authEntryContextSchema,
  authPageVariantSchema,
  authRedirectContextSchema,
  authzSnapshotSchema,
  baseRoleSchema,
  clerkWebhookEventEnvelopeSchema,
  clerkWebhookHeadersSchema,
  clerkUserSyncSchema,
  contextualRoleSchema,
  signedOutRedirectSearchParamsSchema,
  signInSearchParamsSchema,
  signUpSearchParamsSchema,
  sessionUserSchema,
} from "@/schemas/auth"

export type BaseRole = z.infer<typeof baseRoleSchema>
export type ContextualRole = z.infer<typeof contextualRoleSchema>
export type AuthEntryContext = z.infer<typeof authEntryContextSchema>
export type AuthPageVariant = z.infer<typeof authPageVariantSchema>
export type AuthRedirectContext = z.infer<typeof authRedirectContextSchema>
export type SessionUser = z.infer<typeof sessionUserSchema>
export type AuthzSnapshot = z.infer<typeof authzSnapshotSchema>
export type ClerkUserSyncInput = z.infer<typeof clerkUserSyncSchema>
export type SignInSearchParams = z.infer<typeof signInSearchParamsSchema>
export type SignUpSearchParams = z.infer<typeof signUpSearchParamsSchema>
export type AuthCallbackSearchParams = z.infer<typeof authCallbackSearchParamsSchema>
export type SignedOutRedirectSearchParams = z.infer<typeof signedOutRedirectSearchParamsSchema>
export type ClerkWebhookHeaders = z.infer<typeof clerkWebhookHeadersSchema>
export type ClerkWebhookEventEnvelope = z.infer<typeof clerkWebhookEventEnvelopeSchema>
