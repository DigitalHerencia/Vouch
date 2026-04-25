import { z } from "zod"

export const vouchCurrencySchema = z.literal("usd")

export const vouchLabelSchema = z
    .string()
    .trim()
    .min(1, "Label must not be empty.")
    .max(120, "Label must be 120 characters or fewer.")
    .optional()

export const createVouchSchema = z
    .object({
        amountCents: z
            .number()
            .int("Amount must be represented in whole cents.")
            .min(100, "Amount must be at least $1.00."),
        currency: vouchCurrencySchema.default("usd"),
        meetingStartsAt: z.coerce.date(),
        confirmationOpensAt: z.coerce.date(),
        confirmationExpiresAt: z.coerce.date(),
        recipientEmail: z
            .string()
            .trim()
            .email("Enter a valid email address.")
            .max(320)
            .optional()
            .or(z.literal("").transform(() => undefined)),
        label: vouchLabelSchema,
        termsAccepted: z.literal(true, {
            error: "You must accept the Vouch terms before creating a Vouch.",
        }),
    })
    .superRefine((value, ctx) => {
        if (value.confirmationOpensAt >= value.confirmationExpiresAt) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmationExpiresAt"],
                message: "Confirmation expiration must be after confirmation opening.",
            })
        }

        if (value.meetingStartsAt > value.confirmationExpiresAt) {
            ctx.addIssue({
                code: "custom",
                path: ["meetingStartsAt"],
                message: "Meeting start must be before the confirmation deadline.",
            })
        }
    })

export type CreateVouchInput = z.infer<typeof createVouchSchema>

export const acceptVouchSchema = z.object({
    token: z.string().trim().min(24, "Invite token is invalid."),
    termsAccepted: z.literal(true, {
        error: "You must accept the Vouch terms before accepting.",
    }),
})

export type AcceptVouchInput = z.infer<typeof acceptVouchSchema>

export const declineVouchSchema = z.object({
    token: z.string().trim().min(24, "Invite token is invalid."),
})

export type DeclineVouchInput = z.infer<typeof declineVouchSchema>

export const confirmPresenceSchema = z.object({
    vouchId: z.string().trim().min(1, "Vouch ID is required."),
    method: z.enum(["manual", "gps", "system"]).default("manual"),
})

export type ConfirmPresenceInput = z.infer<typeof confirmPresenceSchema>

export const vouchListSearchParamsSchema = z.object({
    status: z
        .enum([
            "action_required",
            "active",
            "pending",
            "completed",
            "expired",
            "refunded",
        ])
        .optional(),
    page: z.coerce.number().int().min(1).default(1),
    sort: z.enum(["newest", "oldest", "deadline"]).default("newest"),
})

export type VouchListSearchParams = z.infer<typeof vouchListSearchParamsSchema>
