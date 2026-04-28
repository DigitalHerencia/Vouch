import { describe, expect, it } from "vitest"

import { normalizeProviderWebhookStatus } from "@/lib/webhooks/provider-webhook-status"

describe("provider webhook status", () => {
  it("normalizes processed webhook records", () => {
    expect(normalizeProviderWebhookStatus({ processed: true, processingError: null })).toBe(
      "processed"
    )
  })

  it("normalizes failed webhook records", () => {
    expect(
      normalizeProviderWebhookStatus({ processed: false, processingError: "bad signature" })
    ).toBe("failed")
  })

  it("normalizes received webhook records", () => {
    expect(normalizeProviderWebhookStatus({ processed: false, processingError: null })).toBe(
      "received"
    )
  })
})
