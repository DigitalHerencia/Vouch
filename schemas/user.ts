import { z } from "zod"
import {
  emailSchema,
  optionalEmailSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
} from "./common"

export const userStatusSchema = z.enum(["active", "disabled"])

export const displayNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().min(1).max(120).optional()
)

export const optionalPhoneSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}, z.string().min(7).max(32).optional())

export const profileBasicsInputSchema = z.object({
  displayName: displayNameSchema,
  phone: optionalPhoneSchema,
})

export const userStatusChangeInputSchema = z.object({
  userId: userIdSchema,
  reason: optionalTrimmedStringSchema,
})

export const authProviderUserInputSchema = z.object({
  clerkUserId: z.string().trim().min(1).max(256),
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  displayName: displayNameSchema,
})

export const userSafeIdentitySchema = z.object({
  userId: userIdSchema,
  displayName: displayNameSchema,
  email: optionalEmailSchema,
})

export const privateAccountInfoSchema = z.object({
  userId: userIdSchema,
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  displayName: displayNameSchema,
  status: userStatusSchema,
})

export const accountPageVariantSchema = z.enum([
  "overview",
  "private_info",
  "disabled",
  "loading",
  "error",
])
