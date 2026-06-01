import "server-only"

import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client"

const unsafeMetadataKeyPattern = /payload|signature|secret|token|card|bank|identity/i

function toSafeMetadata(
  metadata: Record<string, unknown> | undefined
): Prisma.InputJsonObject | undefined {
  if (!metadata) return undefined

  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (unsafeMetadataKeyPattern.test(key)) return false
      if (value === null) return true

      return ["boolean", "number", "string"].includes(typeof value)
    })
  ) as Prisma.InputJsonObject
}

async function writeSystemAudit(
  tx: Tx,
  input: {
    eventName: string
    entityId: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  const metadata = toSafeMetadata(input.metadata)

  await tx.auditEvent.create({
    data: {
      eventName: input.eventName,
      actorType: "system",
      entityType: "User",
      entityId: input.entityId,
      participantSafe: false,
      ...(metadata ? { metadata } : {}),
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
      ...(input.metadata ? toSafeMetadata(input.metadata) : {}),
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
