import "server-only"

import type { Prisma, PrismaClient, WebhookProvider } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function recordProviderWebhookReceivedTx(
  tx: Tx,
  input: {
    provider?: WebhookProvider
    providerEventId: string
    eventType: string
    safeMetadata?: Record<string, unknown>
  }
) {
  const data: Prisma.ProviderWebhookEventCreateInput = {
    provider: input.provider ?? "stripe",
    providerEventId: input.providerEventId,
    eventType: input.eventType,
    status: "received",
    processed: false,
  }
  if (input.safeMetadata !== undefined) {
    data.safeMetadata = input.safeMetadata as Prisma.InputJsonObject
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
          provider: input.provider ?? "stripe",
          providerEventId: input.providerEventId,
        },
      },
      select: { id: true, providerEventId: true, eventType: true, processed: true },
    })

    if (existing) return { event: existing, duplicate: true }
    throw error
  }
}

export async function markProviderWebhookProcessedTx(tx: Tx, input: { id: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "processed",
      processed: true,
      processedAt: new Date(),
      processingError: null,
    },
  })
}

export async function markProviderWebhookIgnoredTx(tx: Tx, input: { id: string; reason?: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
      processingError: input.reason ?? null,
    },
  })
}

export async function markProviderWebhookFailedTx(tx: Tx, input: { id: string; error: string }) {
  return tx.providerWebhookEvent.update({
    where: { id: input.id },
    data: {
      status: "failed",
      processed: false,
      processingError: input.error,
    },
  })
}
