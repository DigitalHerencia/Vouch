import { z } from "zod"

import {
  AGGREGATE_CONFIRMATION_STATUS_VALUES,
  CONFIRMATION_METHOD_VALUES,
  CONFIRMATION_STATUS_VALUES,
  CONFIRM_PRESENCE_VARIANT_VALUES,
  PARTICIPANT_ROLE_VALUES,
  VOUCH_DETAIL_VARIANT_VALUES,
  VOUCH_LIST_SORT_VALUES,
  VOUCH_LIST_STATUS_FILTER_VALUES,
  VOUCH_STATUS_VALUES,
} from "@/lib/vouch/constants"

import { positiveMoneyCentsSchema, vouchIdSchema } from "./commonSchemas"

export const vouchStatusSchema = z.enum(VOUCH_STATUS_VALUES)
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
  })
  .superRefine((value, ctx) => {
    const now = Date.now()
    const appointmentMs = value.appointmentStartsAt.getTime()
    const maxAdvanceMs = 24 * 60 * 60 * 1000

    if (Number.isNaN(appointmentMs)) {
      ctx.addIssue({
        code: "custom",
        path: ["appointmentStartsAt"],
        message: "Enter a valid appointment date and time.",
      })
      return
    }

    if (appointmentMs <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["appointmentStartsAt"],
        message: "Appointment must be in the future.",
      })
    }

    if (appointmentMs - now > maxAdvanceMs) {
      ctx.addIssue({
        code: "custom",
        path: ["appointmentStartsAt"],
        message: "Create a Vouch no more than 24 hours before the appointment.",
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
  submittedCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Confirmation code must be 6 digits."),
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
