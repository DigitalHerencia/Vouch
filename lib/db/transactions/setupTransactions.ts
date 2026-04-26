import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function acceptTermsTx(
  tx: Tx,
  input: { userId: string; termsVersion: string; ipHash?: string; userAgentHash?: string },
) {
  return tx.termsAcceptance.upsert({
    where: {
      userId_termsVersion: {
        userId: input.userId,
        termsVersion: input.termsVersion,
      },
    },
    create: {
      userId: input.userId,
      termsVersion: input.termsVersion,
      ipHash: input.ipHash ?? null,
      userAgentHash: input.userAgentHash ?? null,
    },
    update: {},
  })
}

export async function ensureTermsAcceptanceTx(
  tx: Tx,
  input: { userId: string; termsVersion: string },
) {
  return tx.termsAcceptance.findUnique({
    where: {
      userId_termsVersion: {
        userId: input.userId,
        termsVersion: input.termsVersion,
      },
    },
    select: { id: true, acceptedAt: true },
  })
}

export async function updateSetupGateSnapshotTx(_tx: Tx, _input?: unknown): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/db/transactions/setupTransactions.ts")
}

export async function markSetupBlockedTx(_tx: Tx, _input?: unknown): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/db/transactions/setupTransactions.ts")
}

export async function markSetupReturnedFromInviteTx(_tx: Tx, _input?: unknown): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/db/transactions/setupTransactions.ts")
}

export async function markSetupReturnedFromCreateTx(_tx: Tx, _input?: unknown): Promise<never> {
  throw new Error("SCAFFOLD_NOT_IMPLEMENTED: function stub in lib/db/transactions/setupTransactions.ts")
}
