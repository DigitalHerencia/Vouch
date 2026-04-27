import { z } from "zod"

export const vouchStatusSchema = z.enum([
  "pending",
  "active",
  "completed",
  "expired",
  "refunded",
  "canceled",
  "failed",
])
export const invitationStatusSchema = z.enum([
  "created",
  "sent",
  "opened",
  "accepted",
  "declined",
  "expired",
  "invalidated",
])
export const participantRoleSchema = z.enum(["payer", "payee"])
export const confirmationStatusSchema = z.enum([
  "not_confirmed",
  "confirmed",
  "ineligible",
  "window_not_open",
  "window_closed",
])
export const aggregateConfirmationStatusSchema = z.enum([
  "none_confirmed",
  "payer_confirmed",
  "payee_confirmed",
  "both_confirmed",
])
export const confirmationMethodSchema = z.enum(["manual", "gps", "system"])
export const recipientMethodSchema = z.enum(["email", "link"])
export const vouchListStatusFilterSchema = z.enum([
  "action_required",
  "active",
  "pending",
  "completed",
  "expired",
  "refunded",
])
export const vouchListSortSchema = z.enum(["newest", "oldest", "deadline"])
export const vouchDetailVariantSchema = z.enum([
  "pending",
  "active",
  "completed",
  "expired",
  "refunded",
  "failed",
  "unauthorized",
  "loading",
])
export const confirmPresenceVariantSchema = z.enum([
  "open",
  "before_window",
  "closed",
  "already_confirmed",
  "waiting",
  "success",
  "unauthorized",
  "provider_failure",
])
export const vouchIdParamSchema = z.object({ vouchId: z.string().trim().min(1) })
export const inviteTokenParamSchema = z.object({ token: z.string().trim().min(1) })
export const inviteTokenInputSchema = z.object({ token: z.string().trim().min(1) })
export const feePreviewInputSchema = z.object({ amountCents: z.number().int().min(100) })
export const createVouchDraftInputSchema = z.object({
  amountCents: z.number().int().min(100).optional(),
  currency: z.literal("usd").default("usd"),
})
export const sendVouchInvitationInputSchema = z.object({
  vouchId: z.string().trim().min(1),
  recipientEmail: z.string().trim().email().optional(),
})
export const resendVouchInvitationInputSchema = z.object({ invitationId: z.string().trim().min(1) })
export const cancelPendingVouchInputSchema = z.object({ vouchId: z.string().trim().min(1) })

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
    termsAccepted: z.literal(true).optional(),
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
  token: z.string().trim().min(8, "Invite token is invalid."),
  termsAccepted: z.literal(true).optional(),
})

export type AcceptVouchInput = z.infer<typeof acceptVouchSchema>

export const declineVouchSchema = z.object({
  token: z.string().trim().min(8, "Invite token is invalid."),
})

export type DeclineVouchInput = z.infer<typeof declineVouchSchema>

export const confirmPresenceSchema = z.object({
  vouchId: z.string().trim().min(1, "Vouch ID is required."),
  method: z.enum(["manual", "gps", "system"]).default("manual"),
})

export type ConfirmPresenceInput = z.infer<typeof confirmPresenceSchema>

export const vouchListSearchParamsSchema = z.object({
  status: z
    .enum(["action_required", "active", "pending", "completed", "expired", "refunded"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["newest", "oldest", "deadline"]).default("newest"),
})

export type VouchListSearchParams = z.infer<typeof vouchListSearchParamsSchema>
export const vouchListQuerySchema = vouchListSearchParamsSchema
export const createVouchInputSchema = createVouchSchema
export const acceptVouchInputSchema = acceptVouchSchema
export const declineVouchInputSchema = declineVouchSchema
export const confirmPresenceInputSchema = confirmPresenceSchema
