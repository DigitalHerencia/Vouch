import { z } from "zod"

const internalPathSchema = z
  .string()
  .refine(
    (value) => value.startsWith("/") && !value.startsWith("//") && !value.includes("://"),
    "Enter an internal Vouch path."
  )

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
})

export const verificationSchema = z.object({
  verificationCode: z.string().trim().min(1, "Enter the verification code.").max(32),
})

export const baseRoleSchema = z.enum(["anonymous", "authenticated_user", "admin", "system"])

export const userSyncSchema = z.object({
  clerkUserId: z.string().trim().min(1),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().max(32).optional(),
  displayName: z.string().trim().max(120).optional(),
})

export type UserSyncInput = z.infer<typeof userSyncSchema>

export const authRedirectSearchParamsSchema = z.object({
  redirect_url: internalPathSchema.optional(),
  redirectUrl: internalPathSchema.optional(),
  return_to: internalPathSchema.optional(),
  returnTo: internalPathSchema.optional(),
})

export type AuthRedirectSearchParams = z.infer<typeof authRedirectSearchParamsSchema>

export const supportedClerkWebhookEventTypeSchema = z.enum([
  "email.created",
  "invitation.accepted",
  "invitation.created",
  "invitation.revoked",
  "session.created",
  "session.ended",
  "session.pending",
  "session.removed",
  "session.revoked",
  "sms.created",
  "user.created",
  "user.deleted",
  "user.updated",
])

export const clerkWebhookEventSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().min(1),
    data: z
      .object({
        id: z.string().min(1),
        email_addresses: z
          .array(z.object({ email_address: z.string().optional(), id: z.string().optional() }))
          .optional(),
        primary_email_address_id: z.string().nullable().optional(),
        phone_numbers: z
          .array(z.object({ phone_number: z.string().optional(), id: z.string().optional() }))
          .optional(),
        primary_phone_number_id: z.string().nullable().optional(),
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
        username: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        user_id: z.string().nullable().optional(),
        email_address: z.string().nullable().optional(),
        email_address_id: z.string().nullable().optional(),
        phone_number: z.string().nullable().optional(),
        phone_number_id: z.string().nullable().optional(),
      })
      .passthrough(),
  })
  .passthrough()
