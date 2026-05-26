import type { CurrentUser } from "@/lib/fetchers/authFetchers"
import type {
  AcceptVouchAuthzInput,
  ConfirmPresenceAuthzInput,
  VouchAccessInput,
  VouchReadinessInput,
} from "@/types/auth"

function isActive(input: VouchReadinessInput): boolean {
  return input.userStatus !== "disabled"
}

function hasCreateReadiness(input: VouchReadinessInput): boolean {
  return (
    isActive(input) &&
    input.identityStatus === "verified" &&
    input.adultStatus === "verified" &&
    input.payoutReadiness === "ready" &&
    input.termsAccepted === true
  )
}

function hasAcceptReadiness(input: VouchReadinessInput & { eligible?: boolean }): boolean {
  if (input.eligible !== undefined) {
    return input.eligible
  }

  return (
    isActive(input) &&
    input.identityStatus === "verified" &&
    input.adultStatus === "verified" &&
    input.paymentReadiness === "ready" &&
    input.termsAccepted === true
  )
}

export function canViewVouch(input: VouchAccessInput): boolean {
  if (!input.userId) {
    return false
  }

  return (
    input.isAdmin === true ||
    input.userId === input.merchantId ||
    input.userId === input.customerId ||
    input.inviteValid === true
  )
}

export function canCreateVouch(input: VouchReadinessInput): boolean {
  return hasCreateReadiness(input)
}

export function canAcceptVouch(input: AcceptVouchAuthzInput): boolean {
  return (
    Boolean(input.userId) &&
    isActive(input) &&
    (input.status === "committed" || input.status === "sent") &&
    !input.existingCustomerId &&
    input.userId !== input.merchantId &&
    input.inviteValid &&
    hasAcceptReadiness(input)
  )
}

export function canDeclineVouch(input: {
  userId?: string | null
  merchantId: string
  status: string
  inviteValid: boolean
}): boolean {
  return (
    Boolean(input.userId) &&
    (input.status === "committed" || input.status === "sent") &&
    input.userId !== input.merchantId &&
    input.inviteValid
  )
}

export function canConfirmPresence(input: ConfirmPresenceAuthzInput): boolean {
  const isParticipant =
    Boolean(input.userId) &&
    (input.userId === input.merchantId || input.userId === input.customerId)
  return (
    isParticipant &&
    input.userStatus !== "disabled" &&
    (input.status === "authorized" || input.status === "confirmable") &&
    input.windowOpen &&
    !input.alreadyConfirmed
  )
}

export function canViewAdmin(user: Pick<CurrentUser, "isAdmin" | "status"> | null): boolean {
  return user?.status === "active" && user.isAdmin
}

export const canAccessVouch = canViewVouch
export const canConfirmVouch = canConfirmPresence
