export type ProviderWebhookStatusInput = {
  processed: boolean
  processingError: string | null
}

export type NormalizedProviderWebhookStatus = "received" | "processed" | "failed"

export function normalizeProviderWebhookStatus(
  input: ProviderWebhookStatusInput
): NormalizedProviderWebhookStatus {
  if (input.processed) {
    return "processed"
  }

  if (input.processingError) {
    return "failed"
  }

  return "received"
}
