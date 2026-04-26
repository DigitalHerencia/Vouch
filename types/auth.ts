import type { ComponentProps } from 'react'

export const BASE_ROLE_VALUES = ['anonymous', 'authenticated_user', 'admin', 'system'] as const

export const CONTEXTUAL_ROLE_VALUES = ['payer', 'payee', 'invited_payee_candidate'] as const

export const USER_STATUS_VALUES = ['active', 'disabled'] as const

export const SETUP_REQUIREMENT_VALUES = [
    'identity_verified',
    'adult_verified',
    'payment_ready',
    'payout_ready',
    'terms_accepted',
] as const

export type BaseRole = (typeof BASE_ROLE_VALUES)[number]
export type ContextualRole = (typeof CONTEXTUAL_ROLE_VALUES)[number]
export type UserStatus = (typeof USER_STATUS_VALUES)[number]
export type SetupRequirement = (typeof SETUP_REQUIREMENT_VALUES)[number]

export type AuthCapability =
    | 'view_public_marketing'
    | 'view_public_legal'
    | 'start_auth_flow'
    | 'open_invite_landing'
    | 'view_dashboard'
    | 'view_own_account'
    | 'view_setup_status'
    | 'create_vouch'
    | 'accept_vouch'
    | 'decline_vouch'
    | 'confirm_presence'
    | 'view_vouches_where_participant'
    | 'view_admin_dashboard'
    | 'view_users_operational'
    | 'view_vouches_operational'
    | 'view_payment_records_operational'
    | 'view_audit_events_operational'
    | 'view_webhook_events_operational'
    | 'retry_safe_technical_operation'
    | 'disable_user_account'

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
    role: AuthzContext['baseRole']
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
    return_to?: string
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
    email: string
    password: string
    verificationCode: string
}

export interface LoginFormProps extends ComponentProps<'form'> {
    redirectUrl?: string | undefined
}

export interface SignupFormProps extends ComponentProps<'form'> {
    redirectUrl?: string | undefined
}
