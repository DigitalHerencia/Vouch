import "server-only"

import type { VerificationStatus } from "@/types/verification"

import { getStripeServerClient } from "./client"

export async function createStripeIdentitySession(input: {
  userId: string
  returnUrl: string
  idempotencyKey?: string
}): Promise<{ providerReference: string; url: string | null; clientSecret: string | null }> {
  const session = await getStripeServerClient().identity.verificationSessions.create(
    {
      type: "document",
      metadata: {
        user_id: input.userId,
        vouch_user_id: input.userId,
      },
      return_url: input.returnUrl,
    },
    { idempotencyKey: input.idempotencyKey ?? `user:${input.userId}:identity_session` }
  )

  return {
    providerReference: session.id,
    url: session.url ?? null,
    clientSecret: session.client_secret ?? null,
  }
}

export async function refreshStripeIdentityStatus(input: {
  providerReference: string
}): Promise<{ identityStatus: VerificationStatus; adultStatus: VerificationStatus }> {
  const session = await getStripeServerClient().identity.verificationSessions.retrieve(
    input.providerReference
  )

  const status = mapIdentityStatus(session.status)

  return {
    identityStatus: status,
    adultStatus: status,
  }
}

function mapIdentityStatus(status: string): VerificationStatus {
  switch (status) {
    case "verified":
      return "verified"
    case "requires_input":
      return "requires_action"
    case "processing":
      return "pending"
    case "canceled":
      return "expired"
    default:
      return "pending"
  }
}
