import type { BaseRole } from "./auth"

export type SystemPageVariant =
  | "global_loading"
  | "route_loading_skeleton"
  | "global_error"
  | "protected_route_unauthorized"
  | "entity_not_found"
  | "toast_notification"
  | "form_validation_error"
  | "server_action_failure"
  | "payment_provider_unavailable"
  | "maintenance"
  | "degraded_service"

export type ToastIntent = "success" | "info" | "warning" | "error"

export interface ToastState {
  intent: ToastIntent
  title: string
  message?: string
}

export interface ProtectedRouteUnauthorizedInput {
  path: string
  requiredRole?: BaseRole
  requiredCapability?: string
}

export interface EntityNotFoundInput {
  entityType: string
  entityId?: string
}

export interface ServerActionFailureInput {
  actionName: string
  code?: string
  message?: string
  requestId?: string
}
