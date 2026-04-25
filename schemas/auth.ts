import { z } from "zod"

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

export type AuthRedirectSearchParams = z.infer<
    typeof authRedirectSearchParamsSchema
>
