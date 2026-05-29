import "server-only"

import type { ParticipantRole } from "@/prisma/generated/prisma/client"

export type ParticipantAuthzInput = {
  userId: string
  merchantId?: string | null
  customerId?: string | null
}

export function getParticipantRoleForVouch(input: ParticipantAuthzInput): ParticipantRole | null {
  if (input.merchantId && input.userId === input.merchantId) return "merchant"
  if (input.customerId && input.userId === input.customerId) return "customer"
  return null
}

export function assertParticipantRoleForVouch(input: ParticipantAuthzInput): ParticipantRole {
  const role = getParticipantRoleForVouch(input)

  if (!role) {
    throw new Error("AUTHZ_DENIED: participant access required")
  }

  return role
}

export function assertMerchantForVouch(input: ParticipantAuthzInput): void {
  if (!input.merchantId || input.userId !== input.merchantId) {
    throw new Error("AUTHZ_DENIED: merchant access required")
  }
}

export function assertCustomerForVouch(input: ParticipantAuthzInput): void {
  if (!input.customerId || input.userId !== input.customerId) {
    throw new Error("AUTHZ_DENIED: customer access required")
  }
}

export function isParticipantRole(value: string): value is ParticipantRole {
  return value === "merchant" || value === "customer"
}
