import type { ComponentProps } from "react"

export const BASE_ROLE_VALUES = ["anonymous", "authenticated_user", "admin", "system"] as const

export const CONTEXTUAL_ROLE_VALUES = ["payer", "payee", "invited_payee_candidate"] as const

export const USER_STATUS_VALUES = ["active", "disabled"] as const

export const SETUP_REQUIREMENT_VALUES = [
  "identity_verified",
  "adult_verified",
  "payment_ready",
  "payout_ready",
  "terms_accepted",
] as const

export type BaseRole = (typeof BASE_ROLE_VALUES)[number]
export type ContextualRole = (typeof CONTEXTUAL_ROLE_VALUES)[number]
export type UserStatus = (typeof USER_STATUS_VALUES)[number]
export type SetupRequirement = (typeof SETUP_REQUIREMENT_VALUES)[number]

export type AuthCapability =
  | "view_public_marketing"
  | "view_public_legal"
  | "start_auth_flow"
  | "open_invite_landing"
  | "view_dashboard"
  | "view_own_account"
  | "view_setup_status"
  | "create_vouch"
  | "accept_vouch"
  | "decline_vouch"
  | "confirm_presence"
  | "view_vouches_where_participant"
  | "view_admin_dashboard"
  | "view_users_operational"
  | "view_vouches_operational"
  | "view_payment_records_operational"
  | "view_audit_events_operational"
  | "view_webhook_events_operational"
  | "retry_safe_technical_operation"
  | "disable_user_account"

export type AdminCapability = Extract<
  AuthCapability,
  | "view_admin_dashboard"
  | "view_users_operational"
  | "view_vouches_operational"
  | "view_payment_records_operational"
  | "view_audit_events_operational"
  | "view_webhook_events_operational"
  | "retry_safe_technical_operation"
  | "disable_user_account"
>

export type VouchAccessInput = {
  userId?: string | null
  payerId: string
  payeeId?: string | null
  isAdmin?: boolean
  inviteValid?: boolean
}

export type VouchReadinessInput = {
  userStatus?: UserStatus
  identityStatus?: string
  adultStatus?: string
  paymentReadiness?: string
  payoutReadiness?: string
  termsAccepted?: boolean
}

export type AcceptVouchAuthzInput = VouchReadinessInput & {
  userId?: string | null
  payerId: string
  existingPayeeId?: string | null
  status: string
  inviteValid: boolean
  eligible?: boolean
}

export type ConfirmPresenceAuthzInput = {
  userId?: string | null
  payerId: string
  payeeId?: string | null
  status: string
  windowOpen: boolean
  alreadyConfirmed: boolean
  userStatus?: UserStatus
}

export interface AuthzContext {
  userId: string | null
  baseRole: BaseRole
  contextualRoles: ContextualRole[]
  capabilities: AuthCapability[]
  isAuthenticated: boolean
  isAdmin: boolean
  userStatus: UserStatus | null
}

export interface SessionContext {
  userId: string | null
  isAuthenticated: boolean
  authz: AuthzContext
  role: AuthzContext["baseRole"]
  isAdmin: boolean
}

export interface SessionUser {
  id: string
  clerkUserId: string
  email: string | null
  displayName: string | null
  status: UserStatus
}

export interface Session {
  user: SessionUser | null
  isAuthenticated: boolean
  userId: string | null
}

export interface SetupStatus {
  accountActive: boolean
  identityVerified: boolean
  adultVerified: boolean
  paymentReady: boolean
  payoutReady: boolean
  termsAccepted: boolean
  missingRequirements: SetupRequirement[]
}

export interface AuthRedirectSearchParams {
  redirect_url?: string
  redirectUrl?: string
  return_to?: string
  returnTo?: string
}

export interface LoginPageProps {
  searchParams: Promise<AuthRedirectSearchParams>
}

export interface SignupPageProps {
  searchParams: Promise<AuthRedirectSearchParams>
}

export interface LoginFormValues {
  email: string
  password: string
  verificationCode: string
}

export interface SignupFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  verificationCode: string
  acceptedUserAgreement: boolean
}

export interface LoginFormProps extends ComponentProps<"form"> {
  redirectUrl?: string | undefined
}

export interface SignupFormProps extends ComponentProps<"form"> {
  redirectUrl?: string | undefined
}

export const SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES = [
  "email.created",
  "invitation.accepted",
  "invitation.created",
  "invitation.revoked",
  "session.created",
  "session.ended",
  "session.pending",
  "session.removed",
  "session.revoked",
  "sms.created",
  "user.created",
  "user.deleted",
  "user.updated",
] as const

export type SupportedClerkWebhookEventType = (typeof SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES)[number]

export type ClerkWebhookEventType = SupportedClerkWebhookEventType | (string & {})

export type ClerkWebhookUserData = {
  id: string
  email_addresses?: Array<{ email_address?: string; id?: string }>
  primary_email_address_id?: string | null
  phone_numbers?: Array<{ phone_number?: string; id?: string }>
  primary_phone_number_id?: string | null
  first_name?: string | null
  last_name?: string | null
  username?: string | null
  status?: string | null
  user_id?: string | null
  email_address?: string | null
  email_address_id?: string | null
  phone_number?: string | null
  phone_number_id?: string | null
}

export type ClerkWebhookEvent = {
  id?: string
  type: ClerkWebhookEventType
  data: ClerkWebhookUserData
}

export type ClerkWebhookProcessingStatus = "processed" | "ignored" | "duplicate"

export type ClerkWebhookProcessingResult =
  | { ok: true; status: ClerkWebhookProcessingStatus; ignored?: boolean; reason?: string }
  | { ok: false; status: "failed"; message: string }
