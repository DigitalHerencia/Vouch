import type {
  AcceptVouchAuthzInput,
  ConfirmPresenceAuthzInput,
  VouchAccessInput,
  VouchReadinessInput,
} from "@/types/authTypes"

function isActive(input: VouchReadinessInput): boolean {
  return input.userStatus !== "disabled"
}

function hasCreateReadiness(input: VouchReadinessInput): boolean {
  return isActive(input) && input.payoutReadiness === "ready"
}

export function canViewVouch(input: VouchAccessInput): boolean {
  if (!input.userId) {
    return false
  }

  return input.userId === input.merchantId || input.userId === input.customerId
}

export function canCreateVouch(input: VouchReadinessInput): boolean {
  return hasCreateReadiness(input)
}

export function canAcceptVouch(input: AcceptVouchAuthzInput): boolean {
  return (
    Boolean(input.userId) &&
    isActive(input) &&
    input.status === "protocol_fee_paid" &&
    !input.existingCustomerId &&
    input.userId !== input.merchantId
  )
}

export function canConfirmPresence(input: ConfirmPresenceAuthzInput): boolean {
  const isParticipant =
    Boolean(input.userId) &&
    (input.userId === input.merchantId || input.userId === input.customerId)
  return (
    isParticipant &&
    input.userStatus !== "disabled" &&
    (input.status === "authorized" || input.status === "can_capture") &&
    input.windowOpen &&
    !input.alreadyConfirmed
  )
}
