import type { z } from "zod"
import type {
  settingsPageVariantSchema,
  settingsSearchParamsSchema,
  settingsSectionIdSchema,
  updateProfileBasicsInputSchema,
} from "@/schemas/settings"

export type SettingsPageVariant = z.infer<typeof settingsPageVariantSchema>
export type SettingsSectionID = z.infer<typeof settingsSectionIdSchema>
export type SettingsSearchParams = z.infer<typeof settingsSearchParamsSchema>
export type UpdateProfileBasicsInput = z.infer<typeof updateProfileBasicsInputSchema>