import type { z } from "zod"
import type {
  acceptTermsInputSchema,
  setupActionContextSchema,
  setupChecklistItemStateSchema,
  setupChecklistSearchParamsSchema,
  setupGateInputSchema,
  setupGateResultSchema,
  setupRequirementSchema,
  setupRequirementStatusSchema,
  setupReturnContextSchema,
} from "@/schemas/setup"

export type SetupRequirement = z.infer<typeof setupRequirementSchema>
export type SetupRequirementStatus = z.infer<typeof setupRequirementStatusSchema>
export type SetupActionContext = z.infer<typeof setupActionContextSchema>
export type SetupChecklistItemState = z.infer<typeof setupChecklistItemStateSchema>
export type SetupGateInput = z.infer<typeof setupGateInputSchema>
export type SetupGateResult = z.infer<typeof setupGateResultSchema>
export type SetupReturnContext = z.infer<typeof setupReturnContextSchema>
export type SetupChecklistSearchParams = z.infer<typeof setupChecklistSearchParamsSchema>
export type AcceptTermsInput = z.infer<typeof acceptTermsInputSchema>
