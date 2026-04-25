import { z } from "zod"
import {
  emailSchema,
  internalReturnToPathSchema,
  invitationTokenSchema,
  optionalEmailSchema,
  userIdSchema,
} from "./common"
import { userStatusSchema } from "./user"

export const baseRoleSchema = z.enum([
  "anonymous",
  "authenticated_user",
  "admin",
  "system",
  "payment_provider",
  "auth_provider",
  "verification_provider",
])

export const contextualRoleSchema = z.enum([
  "payer",
  "payee",
  "invited_payee_candidate",
])

export const authEntryContextSchema = z.enum([
  "landing",
  "invite",
  "create_vouch",
  "dashboard",
  "unknown",
])

export const authPageVariantSchema = z.enum([
  "sign_in",
  "sign_in_error",
  "sign_up",
  "sign_up_from_invite",
  "sign_up_from_create_vouch",
  "verification_pending",
  "callback_loading",
  "auth_error",
  "signed_out_redirect",
])

export const sanitizedReturnToSchema = internalReturnToPathSchema
export const sanitizedInviteTokenFromSearchParamsSchema = invitationTokenSchema.optional()

export const authRedirectContextSchema = z.object({
  entryContext: authEntryContextSchema,
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signInSearchParamsSchema = z.object({
  redirect_url: sanitizedReturnToSchema.optional(),
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signUpSearchParamsSchema = signInSearchParamsSchema

export const authCallbackSearchParamsSchema = z.object({
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signedOutRedirectSearchParamsSchema = z.object({
  returnTo: sanitizedReturnToSchema.optional(),
})

export const sessionUserSchema = z.object({
  id: userIdSchema,
  clerkUserId: z.string().min(1),
  email: optionalEmailSchema,
  displayName: z.string().min(1).max(120).optional(),
  status: userStatusSchema,
  baseRole: baseRoleSchema,
})

export const authzSnapshotSchema = z.object({
  userId: userIdSchema,
  baseRole: baseRoleSchema,
  contextualRoles: z.array(contextualRoleSchema),
  isAdmin: z.boolean(),
  isActive: z.boolean(),
})

export const clerkUserSyncSchema = z.object({
  clerkUserId: z.string().min(1),
  email: emailSchema.optional(),
  displayName: z.string().trim().min(1).max(120).optional(),
})

export const clerkWebhookHeadersSchema = z.object({
  "svix-id": z.string().min(1),
  "svix-timestamp": z.string().min(1),
  "svix-signature": z.string().min(1),
})

export const clerkWebhookEventEnvelopeSchema = z.object({
  data: z.unknown(),
  object: z.string().optional(),
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  timestamp: z.number().optional(),
  instance_id: z.string().optional(),
})