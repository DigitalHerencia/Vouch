import type { CurrentUser } from "@/lib/auth/current-user"

export type VouchAccessInput = {
  userId?: string | null
  payerId: string
  payeeId?: string | null
  isAdmin?: boolean
  inviteValid?: boolean
}

export type VouchReadinessInput = {
  userStatus?: "active" | "disabled"
  identityStatus?: string
  adultStatus?: string
  paymentReadiness?: string
  payoutReadiness?: string
  termsAccepted?: boolean
}

export type AcceptVouchInput = VouchReadinessInput & {
  userId?: string | null
  payerId: string
  existingPayeeId?: string | null
  status: string
  inviteValid: boolean
  eligible?: boolean
}

export type ConfirmPresenceInput = {
  userId?: string | null
  payerId: string
  payeeId?: string | null
  status: string
  windowOpen: boolean
  alreadyConfirmed: boolean
  userStatus?: "active" | "disabled"
}

function isActive(input: VouchReadinessInput): boolean {
  return input.userStatus !== "disabled"
}

function hasCreateReadiness(input: VouchReadinessInput): boolean {
  return (
    isActive(input) &&
    input.identityStatus === "verified" &&
    input.adultStatus === "verified" &&
    input.paymentReadiness === "ready" &&
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
    input.payoutReadiness === "ready" &&
    input.termsAccepted === true
  )
}

export function canViewVouch(input: VouchAccessInput): boolean {
  if (!input.userId) {
    return false
  }

  return (
    input.isAdmin === true ||
    input.userId === input.payerId ||
    input.userId === input.payeeId ||
    input.inviteValid === true
  )
}

export function canCreateVouch(input: VouchReadinessInput): boolean {
  return hasCreateReadiness(input)
}

export function canAcceptVouch(input: AcceptVouchInput): boolean {
  return (
    Boolean(input.userId) &&
    isActive(input) &&
    input.status === "pending" &&
    !input.existingPayeeId &&
    input.userId !== input.payerId &&
    input.inviteValid &&
    hasAcceptReadiness(input)
  )
}

export function canDeclineVouch(input: {
  userId?: string | null
  payerId: string
  status: string
  inviteValid: boolean
}): boolean {
  return Boolean(input.userId) && input.status === "pending" && input.userId !== input.payerId && input.inviteValid
}

export function canConfirmPresence(input: ConfirmPresenceInput): boolean {
  const isParticipant = Boolean(input.userId) && (input.userId === input.payerId || input.userId === input.payeeId)
  return (
    isParticipant &&
    input.userStatus !== "disabled" &&
    input.status === "active" &&
    input.windowOpen &&
    !input.alreadyConfirmed
  )
}

export function canViewAdmin(user: Pick<CurrentUser, "isAdmin" | "status"> | null): boolean {
  return user?.status === "active" && user.isAdmin
}

export const canAccessVouch = canViewVouch
export const canConfirmVouch = canConfirmPresence
