import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export const verificationSchema = z.object({
  verificationCode: z.string().trim().min(1),
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
  redirect_url: z.string().optional(),
  redirectUrl: z.string().optional(),
  return_to: z.string().optional(),
  returnTo: z.string().optional(),
})

export type AuthRedirectSearchParams = z.infer<typeof authRedirectSearchParamsSchema>

export const clerkWebhookEventSchema = z
  .object({
    id: z.string().optional(),
    type: z.string().min(1),
    data: z.object({
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
    }),
  })
  .passthrough()
