import { z } from "zod"
import { internalReturnToPathSchema } from "./common"
import { profileBasicsInputSchema } from "./user"

export const settingsPageVariantSchema = z.enum([
  "overview",
  "profile_basics",
  "verification_status",
  "payment_readiness",
  "payout_readiness",
  "terms_legal_status",
  "account_disabled",
  "loading",
  "error",
])

export const settingsSectionIdSchema = z.enum([
  "profile",
  "verification",
  "payment",
  "payout",
  "terms",
  "security",
])

export const sanitizedSettingsSectionParamSchema = settingsSectionIdSchema.optional()
export const sanitizedSettingsReturnToSchema = internalReturnToPathSchema

export const settingsSearchParamsSchema = z.object({
  section: sanitizedSettingsSectionParamSchema,
  returnTo: sanitizedSettingsReturnToSchema.optional(),
})

export const updateProfileBasicsInputSchema = profileBasicsInputSchema

export const settingsStartFlowSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})
