import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type { LocalUserSyncInput } from "@/lib/auth/clerk"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

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

export async function syncUserEmailFromClerkTx(tx: Tx, input: { clerkUserId: string; email?: string }) {
  return tx.user.update({ where: { clerkUserId: input.clerkUserId }, data: { email: input.email ?? null } })
}

export async function syncUserPhoneFromClerkTx(tx: Tx, input: { clerkUserId: string; phone?: string }) {
  return tx.user.update({ where: { clerkUserId: input.clerkUserId }, data: { phone: input.phone ?? null } })
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

export async function recordClerkWebhookProcessedTx(tx: Tx, input: { webhookEventId: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.webhookEventId },
    data: { status: "processed", processed: true, processedAt: new Date(), processingError: null },
  })
}

export async function recordClerkWebhookIgnoredTx(
  tx: Tx,
  input: { webhookEventId: string; reason: string }
) {
  return tx.providerWebhookEvent.update({
    where: { id: input.webhookEventId },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
      processingError: input.reason,
    },
  })
}

export async function recordClerkWebhookFailedTx(
  tx: Tx,
  input: { webhookEventId: string; error: string }
) {
  return tx.providerWebhookEvent.update({
    where: { id: input.webhookEventId },
    data: { status: "failed", processed: false, processingError: input.error },
  })
}
