import type { PROVIDER_WEBHOOK_STATUS_VALUES, WEBHOOK_PROVIDER_VALUES } from "@/lib/vouch/constants"

export type WebhookProviderName = (typeof WEBHOOK_PROVIDER_VALUES)[number]

export type ProviderWebhookStatusInput = {
  processed: boolean
  processingError: string | null
}

export type NormalizedProviderWebhookStatus = (typeof PROVIDER_WEBHOOK_STATUS_VALUES)[number]

export type ProviderWebhookLedgerInput = {
  provider: WebhookProviderName
  providerEventId: string
  eventType: string
  safeMetadata?: Record<string, unknown>
}

type WebhookProcessResult = {
  providerWebhookEventId: string
  providerEventId: string
  eventType: string
  processed: boolean
  duplicate?: boolean
}
