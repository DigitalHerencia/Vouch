import "server-only"

import type { LocalUserSyncInput } from "@/types/authTypes"
import type { PrismaTransactionClient as Tx } from "@/types/commonTypes"

export async function upsertUserFromClerkTx(tx: Tx, input: LocalUserSyncInput) {
  return tx.user.upsert({
    where: { clerkUserId: input.clerkUserId },
    create: {
      clerkUserId: input.clerkUserId,
      email: input.email ?? null,
      phone: input.phone ?? null,
      displayName: input.displayName ?? null,
      status: "active",
    },
    update: {
      email: input.email ?? null,
      phone: input.phone ?? null,
      displayName: input.displayName ?? null,
    },
  })
}

export async function softDisableUserFromClerkDeletedTx(tx: Tx, input: { clerkUserId: string }) {
  return tx.user.updateMany({
    where: { clerkUserId: input.clerkUserId },
    data: { status: "disabled" },
  })
}

export async function recordTermsAcceptanceTx(
  tx: Tx,
  input: {
    userId: string
    termsVersion: string
    acceptedAt: Date
    ipHash?: string | null
    userAgentHash?: string | null
    requestId?: string | null
  }
) {
  return tx.auditEvent.create({
    data: {
      eventName: "user.terms.accepted",
      actorType: "user",
      actorUserId: input.userId,
      entityType: "User",
      entityId: input.userId,
      metadata: {
        terms_version: input.termsVersion,
        accepted_at: input.acceptedAt.toISOString(),
        source: "signup",
      },
    },
  })
}
