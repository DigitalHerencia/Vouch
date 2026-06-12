import "server-only"

import type {
  Prisma,
  WebhookProcessingStatus,
  WebhookProvider,
} from "@/prisma/generated/prisma/client"
import type { PrismaTransactionClient as Tx } from "@/types/commonTypes"

const unsafeMetadataKeyPattern = /payload|signature|secret|token|card|bank|identity/i

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(`INVALID_WEBHOOK_TX_INPUT: ${fieldName} is required`)
  return trimmed
}

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

function processedFromStatus(status: WebhookProcessingStatus): boolean {
  return status === "processed" || status === "ignored"
}

const providerWebhookEventSelect = {
  id: true,
  providerEventId: true,
  eventType: true,
  status: true,
} as const

function withProcessed<T extends { status: WebhookProcessingStatus }>(event: T) {
  return { ...event, processed: processedFromStatus(event.status) }
}

export async function recordProviderWebhookReceivedTx(
  tx: Tx,
  input: {
    provider?: WebhookProvider
    providerEventId: string
    eventType: string
    safeMetadata?: Record<string, unknown>
  }
) {
  const provider = input.provider ?? "stripe"
  const providerEventId = assertNonEmptyString(input.providerEventId, "providerEventId")
  const payload = toSafeMetadata(input.safeMetadata)

  const createResult = await tx.providerWebhookEvent.createMany({
    data: {
      provider,
      providerEventId,
      eventType: assertNonEmptyString(input.eventType, "eventType"),
      status: "received",
      ...(payload ? { payload } : {}),
    },
    skipDuplicates: true,
  })

  const event = await tx.providerWebhookEvent.findUniqueOrThrow({
    where: {
      provider_providerEventId: {
        provider,
        providerEventId,
      },
    },
    select: providerWebhookEventSelect,
  })

  return { event: withProcessed(event), duplicate: createResult.count === 0 }
}

export async function markProviderWebhookProcessedTx(tx: Tx, input: { id: string }) {
  const id = assertNonEmptyString(input.id, "id")
  await tx.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "processed",
      processedAt: new Date(),
      failureReason: null,
    },
  })

  return tx.providerWebhookEvent.findUniqueOrThrow({ where: { id } })
}

export async function markProviderWebhookIgnoredTx(tx: Tx, input: { id: string; reason?: string }) {
  const id = assertNonEmptyString(input.id, "id")
  await tx.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "ignored",
      processedAt: new Date(),
      failureReason: input.reason ?? null,
    },
  })

  return tx.providerWebhookEvent.findUniqueOrThrow({ where: { id } })
}

export async function markProviderWebhookFailedTx(tx: Tx, input: { id: string; error: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: assertNonEmptyString(input.id, "id") },
    data: {
      status: "failed",
      failedAt: new Date(),
      failureReason: assertNonEmptyString(input.error, "error"),
    },
  })
}
