import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function acceptTermsTx(
  tx: Tx,
  input: {
    userId: string
    termsVersion: string
    ipHash?: string
    userAgentHash?: string
  }
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
  input: {
    userId: string
    termsVersion: string
  }
) {
  return tx.termsAcceptance.findUnique({
    where: {
      userId_termsVersion: {
        userId: input.userId,
        termsVersion: input.termsVersion,
      },
    },
    select: {
      id: true,
      acceptedAt: true,
    },
  })
}

export async function updateSetupGateSnapshotTx(
  tx: Tx,
  input: {
    userId: string
  }
): Promise<void> {
  await tx.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
    },
  })
}

export async function markSetupBlockedTx(
  tx: Tx,
  input: {
    userId: string
    reason?: string
  }
): Promise<void> {
  await tx.user.update({
    where: {
      id: input.userId,
    },
    data: {
      status: "disabled",
    },
  })
}

export async function markSetupReturnedFromInviteTx(
  tx: Tx,
  input: {
    userId: string
  }
): Promise<void> {
  await tx.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
    },
  })
}

export async function markSetupReturnedFromCreateTx(
  tx: Tx,
  input: {
    userId: string
  }
): Promise<void> {
  await tx.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
    },
  })
}
