import { z } from "zod"

import {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  CONFIRMATION_STATUS_VALUES,
  CONFIRM_PRESENCE_VARIANT_VALUES,
  INVITATION_STATUS_VALUES,
  PARTICIPANT_ROLE_VALUES,
  VOUCH_DETAIL_VARIANT_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_LIST_STATUS_FILTER_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"

import { positiveMoneyCentsSchema, vouchIdSchema } from "./common"

export const vouchStatusSchema = z.enum(VOUCH_STATUS_VALUES)
export const invitationStatusSchema = z.enum(INVITATION_STATUS_VALUES)
export const participantRoleSchema = z.enum(PARTICIPANT_ROLE_VALUES)
export const confirmationStatusSchema = z.enum(CONFIRMATION_STATUS_VALUES)
export const aggregateConfirmationStatusSchema = z.enum(AGGREGATE_CONFIRMATION_STATUS_VALUES)
export const confirmationMethodSchema = z.enum(CONFIRMATION_METHOD_VALUES)

export const vouchListStatusFilterSchema = z.enum(VOUCH_LIST_STATUS_FILTER_VALUES)
export const vouchListSortSchema = z.enum(VOUCH_LIST_SORT_VALUES)
export const vouchDetailVariantSchema = z.enum(VOUCH_DETAIL_VARIANT_VALUES)
export const confirmPresenceVariantSchema = z.enum(CONFIRM_PRESENCE_VARIANT_VALUES)

export const vouchIdParamSchema = z.object({
  vouchId: vouchIdSchema,
})

export const feePreviewInputSchema = z.object({
  amountCents: positiveMoneyCentsSchema,
  currency: z.literal("usd").default("usd"),
})

export const createVouchDraftSchema = z
  .object({
    amountCents: positiveMoneyCentsSchema,
    currency: z.literal("usd").default("usd"),
    appointmentStartsAt: z.coerce.date(),
    confirmationOpensAt: z.coerce.date(),
    confirmationExpiresAt: z.coerce.date(),
  })
  .superRefine((value, ctx) => {
    if (value.confirmationOpensAt >= value.confirmationExpiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmationExpiresAt"],
        message: "Confirmation expiration must be after confirmation opening.",
      })
    }

    if (value.appointmentStartsAt > value.confirmationExpiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["appointmentStartsAt"],
        message: "Appointment must occur before the confirmation deadline.",
      })
    }
  })

export const confirmCreateVouchSchema = createVouchDraftSchema.extend({
  disclaimerAccepted: z.literal(true, {
    error: "You must accept the conditional payment disclaimer before creating this Vouch.",
  }),
})

export const confirmPresenceSchema = z.object({
  vouchId: vouchIdSchema,
  submittedCode: z.string().trim().min(4).max(12),
  method: confirmationMethodSchema.default("code_exchange"),
})

export const archiveVouchSchema = z.object({
  vouchId: vouchIdSchema,
})

export const vouchListSearchParamsSchema = z.object({
  status: vouchListStatusFilterSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: vouchListSortSchema.default("newest"),
})

export type CreateVouchDraftInput = z.infer<typeof createVouchDraftSchema>
export type ConfirmCreateVouchInput = z.infer<typeof confirmCreateVouchSchema>
export type ConfirmPresenceInput = z.infer<typeof confirmPresenceSchema>
export type ArchiveVouchInput = z.infer<typeof archiveVouchSchema>
export type VouchListSearchParams = z.infer<typeof vouchListSearchParamsSchema>

/**
 * Backward-compatible schema aliases retained only to keep Pass 4 isolated.
 * Later passes should migrate call sites to the canonical schema names.
 */
export const createVouchSchema = confirmCreateVouchSchema
export const createVouchInputSchema = confirmCreateVouchSchema
export const createVouchDraftInputSchema = createVouchDraftSchema
export const confirmCreateVouchInputSchema = confirmCreateVouchSchema
export const confirmPresenceInputSchema = confirmPresenceSchema
export const vouchListQuerySchema = vouchListSearchParamsSchema

export type CreateVouchInput = ConfirmCreateVouchInput
