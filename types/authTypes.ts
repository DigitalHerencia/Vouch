import type { ComponentProps } from "react"

type SessionUser = {
  id: string
  clerkUserId: string
  email: string | null
  displayName: string | null
  status: UserStatus
}

type AuthRedirectSearchParams = {
  redirect_url?: string
  redirectUrl?: string
  return_to?: string
  returnTo?: string
}

type ClerkWebhookEventType = (typeof SUPPORTED_CLERK_WEBHOOK_EVENT_TYPES)[number] | (string & {})
type ClerkWebhookData = ClerkWebhookUserData & { user?: ClerkWebhookUserData | null }

export const BASE_ROLE_VALUES = ["anonymous", "authenticated_user", "admin", "system"] as const
export const CONTEXTUAL_ROLE_VALUES = ["merchant", "customer"] as const
export const USER_STATUS_VALUES = ["active", "suspended", "disabled"] as const
export const SETUP_REQUIREMENT_VALUES = ["payout_ready"] as const

type UserStatus = (typeof USER_STATUS_VALUES)[number]

export type VouchAccessInput = {
  userId?: string | null
  merchantId: string
  customerId?: string | null
}

export type VouchReadinessInput = {
  userStatus?: UserStatus
  payoutReadiness?: string
}

export type AcceptVouchAuthzInput = VouchReadinessInput & {
  userId?: string | null
  merchantId: string
  existingCustomerId?: string | null
  status: string
}

export type ConfirmPresenceAuthzInput = {
  userId?: string | null
  merchantId: string
  customerId?: string | null
  status: string
  windowOpen: boolean
  alreadyConfirmed: boolean
  userStatus?: UserStatus
}

export interface Session {
  user: SessionUser | null
  isAuthenticated: boolean
  userId: string | null
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
  "session.created",
  "session.ended",
  "session.pending",
  "session.removed",
  "session.revoked",
  "user.created",
  "user.deleted",
  "user.updated",
] as const

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
  data: ClerkWebhookData
}

export type LocalUserSyncInput = {
  clerkUserId: string
  email?: string | null
  phone?: string | null
  displayName?: string | null
}
