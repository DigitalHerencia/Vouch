import { z } from "zod"

import { CONFIRMATION_METHOD_VALUES } from "@/lib/vouch/constants"

const vouchIdSchema = z.string().min(1).max(128)
const positiveMoneyCentsSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? Math.round(Number(value)) : value),
  z.number().int().positive()
)

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
  method: z.enum(CONFIRMATION_METHOD_VALUES).default("code_exchange"),
})

export const archiveVouchSchema = z.object({
  vouchId: vouchIdSchema,
})
