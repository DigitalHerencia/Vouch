import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type SystemEventInput = {
  code: string
  message: string
  metadata?: Record<string, unknown>
}

async function writeSystemAudit(
  tx: Tx,
  input: {
    eventName: string
    entityId: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  await tx.auditEvent.create({
    data: {
      eventName: input.eventName,
      actorType: "system",
      entityType: "User",
      entityId: input.entityId,
      participantSafe: false,
    },
  })
}

export async function recordOperationalErrorTx(tx: Tx, input: SystemEventInput): Promise<void> {
  await writeSystemAudit(tx, {
    eventName: "payment.reconciliation_failed",
    entityId: "system",
    metadata: {
      code: input.code,
      message: input.message,
      ...(input.metadata ? { metadata: input.metadata } : {}),
    },
  })
}

export async function recordServerActionFailureTx(
  tx: Tx,
  input: {
    actionName: string
    code?: string
    message?: string
    requestId?: string
  }
): Promise<void> {
  await writeSystemAudit(tx, {
    eventName: "payment.reconciliation_failed",
    entityId: "system",
    metadata: {
      actionName: input.actionName,
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.message !== undefined ? { message: input.message } : {}),
      ...(input.requestId !== undefined ? { requestId: input.requestId } : {}),
    },
  })
}

export async function recordProviderUnavailableTx(
  tx: Tx,
  input: {
    provider: string
    code?: string
    message?: string
  }
): Promise<void> {
  await writeSystemAudit(tx, {
    eventName: "payment.reconciliation_failed",
    entityId: "system",
    metadata: {
      provider: input.provider,
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.message !== undefined ? { message: input.message } : {}),
    },
  })
}

export async function recordMaintenanceBannerTx(
  tx: Tx,
  input: {
    title: string
    message?: string
  }
): Promise<void> {
  await writeSystemAudit(tx, {
    eventName: "payment.reconciliation_failed",
    entityId: "system",
    metadata: {
      title: input.title,
      ...(input.message !== undefined ? { message: input.message } : {}),
    },
  })
}
