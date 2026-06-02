import { describe, expect, it } from "vitest"

import { deriveConfirmationCode, verifyConfirmationCode } from "@/lib/vouch/confirmation-codes"

describe("confirmation code helpers", () => {
  it("creates six digit confirmation codes", () => {
    process.env.CONFIRMATION_CODE_SECRET = "test-secret"

    const code = deriveConfirmationCode({
      vouchId: "vouch_1",
      publicId: "VCH-1",
      participantRole: "merchant",
      participantUserId: "user_1",
      at: new Date("2026-01-01T10:00:00.000Z"),
    })

    expect(code).toMatch(/^\d{6}$/)
  })

  it("verifies derived confirmation codes", () => {
    process.env.CONFIRMATION_CODE_SECRET = "test-secret"
    const input = {
      vouchId: "vouch_1",
      publicId: "VCH-1",
      participantRole: "merchant" as const,
      participantUserId: "user_1",
      at: new Date("2026-01-01T10:00:00.000Z"),
    }
    const code = deriveConfirmationCode(input)

    expect(verifyConfirmationCode({ ...input, submittedCode: code })).toBe(true)
  })
})
