import type {
  NormalizedProviderWebhookStatus,
  ProviderWebhookStatusInput,
} from "@/types/webhooksTypes"

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
