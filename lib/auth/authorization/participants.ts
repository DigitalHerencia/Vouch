import "server-only"

import { assertAllowed } from "@/lib/auth/authorization/assertions"

export type VouchParticipantInput = {
  userId: string
  payerId: string
  payeeId?: string | null
}

export type ParticipantRole = "payer" | "payee"

export function getParticipantRoleForVouch(input: VouchParticipantInput): ParticipantRole | null {
  if (input.userId === input.payerId) {
    return "payer"
  }
  if (input.payeeId && input.userId === input.payeeId) {
    return "payee"
  }
  return null
}

export function assertVouchParticipant(input: VouchParticipantInput): ParticipantRole {
  const role = getParticipantRoleForVouch(input)
  if (!role) {
    assertAllowed(false, "User is not a Vouch participant")
  }
  return role
}

export function assertPayer(input: VouchParticipantInput): void {
  assertAllowed(getParticipantRoleForVouch(input) === "payer", "Payer access required")
}

export function assertPayee(input: VouchParticipantInput): void {
  assertAllowed(getParticipantRoleForVouch(input) === "payee", "Accepted payee access required")
}

export function assertInviteCandidate(input: {
  userId: string
  payerId: string
  vouchStatus: string
  inviteValid: boolean
}): void {
  assertAllowed(input.vouchStatus === "pending", "Vouch is not pending")
  assertAllowed(input.userId !== input.payerId, "Payer may not accept their own Vouch")
  assertAllowed(input.inviteValid, "Valid invitation required")
}
