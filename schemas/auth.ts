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
  returnTo: z.string().optional(),
})

export type AuthRedirectSearchParams = z.infer<typeof authRedirectSearchParamsSchema>
