import type { ReactNode } from "react"
import type { BaseRole } from "./authTypes"

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

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

type LogMetadata = Record<string, unknown>

type RuntimeEnv = {
  databaseUrl: string
  clerkSecretKey: string | undefined
  clerkWebhookSecret: string | undefined
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripePublishableKey: string | undefined
  appUrl: string
  vercelUrl: string | undefined
  adminEmail: string | undefined
  adminUserIds: string[]
  emailProvider: string | undefined
  emailApiUrl: string | undefined
  emailApiKey: string | undefined
  emailFrom: string | undefined
}

type SystemEventInput = {
  code: string
  message: string
  metadata?: Record<string, unknown>
}
