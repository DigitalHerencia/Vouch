import { z } from "zod"
import { internalReturnToPathSchema, optionalTrimmedStringSchema } from "./common"
import { baseRoleSchema } from "./auth"

export const systemPageVariantSchema = z.enum([
  "global_loading",
  "route_loading_skeleton",
  "global_error",
  "protected_route_unauthorized",
  "entity_not_found",
  "toast_notification",
  "form_validation_error",
  "server_action_failure",
  "payment_provider_unavailable",
  "maintenance",
  "degraded_service",
])

export const toastIntentSchema = z.enum(["success", "info", "warning", "error"])

export const toastStateSchema = z.object({
  intent: toastIntentSchema,
  title: z.string().min(1).max(120),
  message: z.string().max(500).optional(),
})

export const sanitizedErrorMessageSchema = optionalTrimmedStringSchema
export const sanitizedEntityTypeSchema = z.string().trim().min(1).max(80)
export const sanitizedActionNameSchema = z.string().trim().min(1).max(120)

export const protectedRouteUnauthorizedInputSchema = z.object({
  path: internalReturnToPathSchema,
  requiredRole: baseRoleSchema.optional(),
  requiredCapability: optionalTrimmedStringSchema,
})

export const entityNotFoundInputSchema = z.object({
  entityType: sanitizedEntityTypeSchema,
  entityId: optionalTrimmedStringSchema,
})

export const serverActionFailureInputSchema = z.object({
  actionName: sanitizedActionNameSchema,
  code: optionalTrimmedStringSchema,
  message: sanitizedErrorMessageSchema,
  requestId: optionalTrimmedStringSchema,
})

export const healthcheckSchema = z.object({
  ok: z.boolean(),
  service: z.string().min(1).max(80),
})

export const revalidateTagInputSchema = z.object({
  tag: z.string().trim().min(1).max(160),
})
