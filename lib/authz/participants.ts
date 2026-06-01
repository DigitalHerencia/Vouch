import "server-only"

import type { ParticipantRole } from "@/prisma/generated/prisma/client"

type ParticipantAuthzInput = {
  userId?: string | null
  merchantId?: string | null
  customerId?: string | null
}

export function getParticipantRoleForVouch(input: ParticipantAuthzInput): ParticipantRole | null {
  if (input.merchantId && input.userId === input.merchantId) return "merchant"
  if (input.customerId && input.userId === input.customerId) return "customer"
  return null
}
