import { describe, expect, it } from "vitest"

import {
  acceptTermsSchema,
  internalReturnToSchema,
  setupIntentSchema,
} from "@/schemas/setup.schemas"

describe("setup schemas", () => {
  it("accepts current terms agreement", () => {
    const result = acceptTermsSchema.safeParse({
      termsVersion: "2026-04-25",
      accepted: true,
    })

    expect(result.success).toBe(true)
  })

  it("rejects unaccepted terms", () => {
    const result = acceptTermsSchema.safeParse({
      termsVersion: "2026-04-25",
      accepted: false,
    })

    expect(result.success).toBe(false)
  })

  it("allows only internal return paths", () => {
    expect(internalReturnToSchema.safeParse("/dashboard").success).toBe(true)
    expect(internalReturnToSchema.safeParse("/vouches/invite/token").success).toBe(true)
    expect(internalReturnToSchema.safeParse("https://evil.example/vouches").success).toBe(false)
    expect(internalReturnToSchema.safeParse("//evil.example").success).toBe(false)
    expect(internalReturnToSchema.safeParse("javascript:alert(1)").success).toBe(false)
    expect(internalReturnToSchema.safeParse("/\\evil").success).toBe(false)
  })

  it("accepts supported setup intents", () => {
    expect(setupIntentSchema.safeParse("create").success).toBe(true)
    expect(setupIntentSchema.safeParse("accept").success).toBe(true)
    expect(setupIntentSchema.safeParse("both").success).toBe(true)
  })
})
