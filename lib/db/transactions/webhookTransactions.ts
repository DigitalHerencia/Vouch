import "server-only"

import type { Prisma, PrismaClient, WebhookProvider } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

const unsafeMetadataKeyPattern = /payload|signature|secret|token|card|bank|identity/i

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`INVALID_WEBHOOK_TX_INPUT: ${fieldName} is required`)
  }

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

  const data: Prisma.ProviderWebhookEventCreateInput = {
    provider,
    providerEventId,
    eventType: assertNonEmptyString(input.eventType, "eventType"),
    status: "received",
    processed: false,
  }
  const safeMetadata = toSafeMetadata(input.safeMetadata)
  if (safeMetadata !== undefined) {
    data.safeMetadata = safeMetadata
  }

  try {
    const event = await tx.providerWebhookEvent.create({
      data,
      select: { id: true, providerEventId: true, eventType: true, processed: true },
    })

    return { event, duplicate: false }
  } catch (error) {
    const existing = await tx.providerWebhookEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider,
          providerEventId,
        },
      },
      select: { id: true, providerEventId: true, eventType: true, processed: true },
    })

    if (existing) return { event: existing, duplicate: true }
    throw error
  }
}

export async function markProviderWebhookProcessedTx(tx: Tx, input: { id: string }) {
  const id = assertNonEmptyString(input.id, "id")
  const updated = await tx.providerWebhookEvent.updateMany({
    where: { id, processed: false },
    data: {
      status: "processed",
      processed: true,
      processedAt: new Date(),
      processingError: null,
    },
  })

  if (updated.count !== 1) {
    throw new Error("WEBHOOK_ALREADY_PROCESSED")
  }

  return tx.providerWebhookEvent.findUniqueOrThrow({ where: { id } })
}

export async function markProviderWebhookIgnoredTx(tx: Tx, input: { id: string; reason?: string }) {
  const id = assertNonEmptyString(input.id, "id")
  const updated = await tx.providerWebhookEvent.updateMany({
    where: { id, processed: false },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
      processingError: input.reason ?? null,
    },
  })

  if (updated.count !== 1) {
    throw new Error("WEBHOOK_ALREADY_PROCESSED")
  }

  return tx.providerWebhookEvent.findUniqueOrThrow({ where: { id } })
}

export async function markProviderWebhookFailedTx(tx: Tx, input: { id: string; error: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: assertNonEmptyString(input.id, "id") },
    data: {
      status: "failed",
      processed: false,
      processingError: assertNonEmptyString(input.error, "error"),
    },
  })
}
