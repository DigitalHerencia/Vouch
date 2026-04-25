import type { z } from "zod"
import type {
  acceptTermsInputSchema,
  setupActionContextSchema,
  setupChecklistItemStateSchema,
  setupGateResultSchema,
  setupRequirementSchema,
  setupRequirementStatusSchema,
} from "@/schemas/setup"

export type SetupRequirement = z.infer<typeof setupRequirementSchema>
export type SetupRequirementStatus = z.infer<typeof setupRequirementStatusSchema>
export type SetupActionContext = z.infer<typeof setupActionContextSchema>
export type SetupChecklistItemState = z.infer<typeof setupChecklistItemStateSchema>
export type SetupGateResult = z.infer<typeof setupGateResultSchema>
export type AcceptTermsInput = z.infer<typeof acceptTermsInputSchema>