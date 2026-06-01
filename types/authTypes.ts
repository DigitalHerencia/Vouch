import type { Input } from "@base-ui/react"
import type { ComponentProps, ReactNode } from "react"
import type { VouchPricing } from "./vouchTypes"

export const BASE_ROLE_VALUES = ["anonymous", "authenticated_user", "admin", "system"] as const

export const CONTEXTUAL_ROLE_VALUES = ["merchant", "customer"] as const

export const USER_STATUS_VALUES = ["active", "suspended", "disabled"] as const

export const SETUP_REQUIREMENT_VALUES = [
  "payment_ready",
  "payout_ready",
  "useragreement_accepted",
] as const

export type BaseRole = (typeof BASE_ROLE_VALUES)[number]
export type ContextualRole = (typeof CONTEXTUAL_ROLE_VALUES)[number]
export type UserStatus = (typeof USER_STATUS_VALUES)[number]
export type SetupRequirement = (typeof SETUP_REQUIREMENT_VALUES)[number]

export type AuthCapability =
  | "view_public_marketing"
  | "view_public_legal"
  | "start_auth_flow"
  | "view_dashboard"
  | "view_own_account"
  | "create_vouch"
  | "confirm_presence"
  | "view_vouches_where_participant"

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
  | "suspend_user_account"
>

export type VouchAccessInput = {
  userId?: string | null
  merchantId: string
  customerId?: string | null
  isAdmin?: boolean
}

export type VouchReadinessInput = {
  userStatus?: UserStatus
  paymentMethodReady?: string
  payoutReadiness?: string
  useragreementAccepted?: boolean
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
  paymentReady: boolean
  payoutReady: boolean
  useragreementAccepted: boolean
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

export interface AuthShellProps {
  children: ReactNode
}

// ============================================================================
// AUTH VARIANT 1: Login Form
// ============================================================================
export interface LoginFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: React.ReactNode
  error?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  signUpHref?: string | undefined
  signUpPrompt?: string | undefined
  signUpLabel?: string | undefined
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: Array<"google" | "github">
}

export interface LoginFormFieldsProps {
  emailInputProps: React.ComponentProps<typeof Input>
  passwordInputProps: React.ComponentProps<typeof Input>
  emailError?: string | undefined
  passwordError?: string | undefined
  passwordDescription?: string | undefined
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
}

// ============================================================================
// AUTH VARIANT 2: Sign Up Form
// ============================================================================
export interface SignUpFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: React.ReactNode
  error?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  signInHref?: string | undefined
  signInPrompt?: string | undefined
  signInLabel?: string | undefined
  onSubmit?: (data: { name: string; email: string; password: string; terms: boolean }) => void
  onSignIn?: () => void
  socialProviders?: Array<"google" | "github">
  termsUrl?: string
  privacyUrl?: string
}

export interface SignUpFormFieldsProps {
  firstNameInputProps: React.ComponentProps<typeof Input>
  lastNameInputProps: React.ComponentProps<typeof Input>
  emailInputProps: React.ComponentProps<typeof Input>
  passwordInputProps: React.ComponentProps<typeof Input>
  firstNameError?: string | undefined
  lastNameError?: string | undefined
  emailError?: string | undefined
  passwordError?: string | undefined
  agreementError?: string | undefined
  agreementChecked: boolean
  agreementLabel: React.ReactNode
  onAgreementChange: (checked: boolean) => void
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
  captcha?: React.ReactNode
}

// ============================================================================
// AUTH VARIANT 5: Split Auth Layout
// ============================================================================
export interface AuthSplitLayoutProps {
  children: React.ReactNode
  brandContent?: React.ReactNode
  position?: "left" | "right"
}

export type CreateStripeCheckoutAuthorizationInput = {
  vouchId: string
  pricing: VouchPricing
  currency: string
  connectedAccountId: string
  providerCustomerId?: string
  successUrl: string
  cancelUrl?: string
  idempotencyKey: string
}

type CurrentUserAuthRecord = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  verificationProfile: {
    identityStatus: string
    adultStatus: string
  } | null
  paymentCustomer: { readiness: string } | null
  connectedAccount: { readiness: string } | null
  termsAcceptances: Array<{
    termsVersion: string
    acceptedAt: Date
  }>
}

export type ParticipantAuthzInput = {
  userId: string
  merchantId?: string | null
  customerId?: string | null
}

export type ClerkUserLike = {
  id: string
  emailAddresses?: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  phoneNumbers?: Array<{ id: string; phoneNumber: string }>
  primaryPhoneNumberId?: string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
}
