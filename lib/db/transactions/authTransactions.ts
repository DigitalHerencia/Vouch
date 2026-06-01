// lib/db/transactions/authTransactions.ts

import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

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
  return tx.verificationProfile.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId },
    update: {},
  })
}

export async function syncUserEmailFromClerkTx(
  tx: Tx,
  input: { clerkUserId: string; email?: string }
) {
  return tx.user.update({
    where: { clerkUserId: input.clerkUserId },
    data: { email: input.email ?? null },
  })
}

export async function syncUserPhoneFromClerkTx(
  tx: Tx,
  input: { clerkUserId: string; phone?: string }
) {
  return tx.user.update({
    where: { clerkUserId: input.clerkUserId },
    data: { phone: input.phone ?? null },
  })
}

export async function syncUserDisplayNameFromClerkTx(
  tx: Tx,
  input: { clerkUserId: string; displayName?: string }
) {
  return tx.user.update({
    where: { clerkUserId: input.clerkUserId },
    data: { displayName: input.displayName ?? null },
  })
}

export async function softDisableUserFromClerkDeletedTx(tx: Tx, input: { clerkUserId: string }) {
  return tx.user.updateMany({
    where: { clerkUserId: input.clerkUserId },
    data: { status: "disabled" },
  })
}

export async function ensureUserSetupRecordsTx(tx: Tx, input: { userId: string }) {
  return createDefaultVerificationProfileTx(tx, input)
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
  const acceptance = await tx.termsAcceptance.upsert({
    where: {
      userId_termsVersion: {
        userId: input.userId,
        termsVersion: input.termsVersion,
      },
    },
    create: {
      userId: input.userId,
      termsVersion: input.termsVersion,
      acceptedAt: input.acceptedAt,
      ipHash: input.ipHash ?? null,
      userAgentHash: input.userAgentHash ?? null,
    },
    update: {},
  })

  await tx.auditEvent.create({
    data: {
      eventName: "user.terms.accepted",
      actorType: "user",
      actorUserId: input.userId,
      entityType: "TermsAcceptance",
      entityId: acceptance.id,
      requestId: input.requestId ?? null,
      metadata: {
        terms_version: input.termsVersion,
        source: "signup",
      },
    },
  })

  return acceptance
}
