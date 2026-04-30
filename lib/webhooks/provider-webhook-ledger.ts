import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

import { prisma } from "@/lib/db/prisma"
import type { ProviderWebhookLedgerInput } from "@/types/webhooks"

export async function recordProviderWebhookReceived(input: ProviderWebhookLedgerInput) {
  return prisma.providerWebhookEvent.upsert({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId,
      },
    },
    create: {
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      status: "received",
      processed: false,
      safeMetadata: (input.safeMetadata ?? {}) as Prisma.InputJsonValue,
    },
    update: {},
  })
}

export async function markProviderWebhookProcessed(id: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "processed",
      processed: true,
      processedAt: new Date(),
      processingError: null,
    },
  })
}

export async function markProviderWebhookIgnored(id: string, reason: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "ignored",
      processed: true,
      processedAt: new Date(),
      processingError: reason,
    },
  })
}

export async function markProviderWebhookFailed(id: string, error: string) {
  return prisma.providerWebhookEvent.update({
    where: { id },
    data: {
      status: "failed",
      processed: false,
      processingError: error,
    },
  })
}
