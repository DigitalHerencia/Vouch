import type { z } from "zod"
import type {
  entityNotFoundInputSchema,
  protectedRouteUnauthorizedInputSchema,
  serverActionFailureInputSchema,
  systemPageVariantSchema,
  toastIntentSchema,
  toastStateSchema,
} from "@/schemas/system"

export type SystemPageVariant = z.infer<typeof systemPageVariantSchema>
export type ToastIntent = z.infer<typeof toastIntentSchema>
export type ToastState = z.infer<typeof toastStateSchema>
export type ProtectedRouteUnauthorizedInput = z.infer<typeof protectedRouteUnauthorizedInputSchema>
export type EntityNotFoundInput = z.infer<typeof entityNotFoundInputSchema>
export type ServerActionFailureInput = z.infer<typeof serverActionFailureInputSchema>