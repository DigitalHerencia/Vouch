import { z } from "zod"

export function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value
}

export function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value
}

export function normalizeEmail(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value
}

export function normalizeCurrency(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value
}

export function sanitizeInternalPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()

  if (!trimmed.startsWith("/")) return undefined
  if (trimmed.startsWith("//")) return undefined
  if (trimmed.includes("://")) return undefined
  if (trimmed.includes("\\") || trimmed.includes("\0")) return undefined

  return trimmed
}

export function coercePositiveInt(value: unknown): unknown {
  if (typeof value === "string" && value.trim() !== "") {
    return Number.parseInt(value, 10)
  }

  return value
}

export function coerceMoneyCents(value: unknown): unknown {
  if (typeof value === "string" && value.trim() !== "") {
    return Math.round(Number(value))
  }

  return value
}

export const idSchema = z.string().min(1).max(128)
export const publicIdSchema = z.string().min(1).max(128)
export const userIdSchema = idSchema
export const vouchIdSchema = idSchema
export const invitationTokenSchema = z
  .preprocess(trimString, z.string().min(16).max(256).regex(/^[A-Za-z0-9_-]+$/))

export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime({ offset: false }))

export const currencyCodeSchema = z.preprocess(normalizeCurrency, z.literal("usd"))

export const moneyCentsSchema = z.preprocess(
  coerceMoneyCents,
  z.number().int().nonnegative()
)

export const positiveMoneyCentsSchema = z.preprocess(
  coerceMoneyCents,
  z.number().int().positive()
)

export const percentageBasisPointsSchema = z.number().int().min(0).max(10_000)

export const paginationInputSchema = z.object({
  page: z.preprocess(coercePositiveInt, z.number().int().min(1)).optional(),
  pageSize: z.preprocess(coercePositiveInt, z.number().int().min(1).max(100)).optional(),
})

export const dateRangeInputSchema = z
  .object({
    from: isoDateTimeSchema.optional(),
    to: isoDateTimeSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.from || !value.to) return

    if (new Date(value.from).getTime() > new Date(value.to).getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "End date must be after start date.",
      })
    }
  })

export const internalReturnToPathSchema = z
  .preprocess(emptyStringToUndefined, z.string().optional())
  .transform(sanitizeInternalPath)

export const emailSchema = z.preprocess(
  normalizeEmail,
  z.string().email().max(320)
)

export const optionalEmailSchema = z.preprocess(
  emptyStringToUndefined,
  emailSchema.optional()
)

export const trimmedStringSchema = z.preprocess(trimString, z.string())
export const optionalTrimmedStringSchema = z.preprocess(
  emptyStringToUndefined,
  trimmedStringSchema.optional()
)

export const shortLabelSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).max(120).optional()
)

export const privateNoteSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(500).optional()
)

export const safeSearchParamSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(128).optional()
)

export const safeMetadataSchema = z.record(z.string(), z.unknown()).default({})
