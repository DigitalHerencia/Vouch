export type WebhookProviderName = "clerk" | "stripe" | "stripe_identity"

export type ProviderWebhookStatusInput = {
  processed: boolean
  processingError: string | null
}

export type NormalizedProviderWebhookStatus = "received" | "processed" | "failed"

export type ProviderWebhookLedgerInput = {
  provider: WebhookProviderName
  providerEventId: string
  eventType: string
  safeMetadata?: Record<string, unknown>
}
