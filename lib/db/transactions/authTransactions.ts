import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

type LocalUserSyncInput = {
  clerkUserId: string
  email?: string | null
  phone?: string | null
  displayName?: string | null
}

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

export async function createDefaultVerificationProfileTx(tx: Tx, input: { userId: string }) {
  return tx.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { id: true },
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
