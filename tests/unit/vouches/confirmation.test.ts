import { describe, expect, it } from "vitest"

import { deriveAggregateConfirmationStatus } from "@/lib/vouch/state"
import { isConfirmationWindowOpen } from "@/lib/vouch/time-windows"
import { deriveConfirmationCode, verifyConfirmationCode } from "@/lib/vouch/confirmation-codes"

describe("confirmation helpers", () => {
  it("detects an open confirmation window", () => {
    expect(
      isConfirmationWindowOpen({
        now: new Date("2026-01-01T10:15:00.000Z"),
        confirmationOpensAt: new Date("2026-01-01T10:00:00.000Z"),
        confirmationExpiresAt: new Date("2026-01-01T10:30:00.000Z"),
      })
    ).toBe(true)
  })

  it("blocks confirmation before window opens", () => {
    expect(
      isConfirmationWindowOpen({
        now: new Date("2026-01-01T09:59:59.000Z"),
        confirmationOpensAt: new Date("2026-01-01T10:00:00.000Z"),
        confirmationExpiresAt: new Date("2026-01-01T10:30:00.000Z"),
      })
    ).toBe(false)
  })

  it("reports aggregate confirmation status", () => {
    expect(
      deriveAggregateConfirmationStatus({
        merchantConfirmed: true,
        customerConfirmed: false,
      })
    ).toBe("merchant_confirmed")

    expect(
      deriveAggregateConfirmationStatus({
        merchantConfirmed: true,
        customerConfirmed: true,
      })
    ).toBe("both_confirmed")
  })

  it("derives role-specific confirmation codes and validates only matching submissions", () => {
    process.env.CONFIRMATION_CODE_SECRET = "test-confirmation-secret"

    const at = new Date("2026-01-01T10:15:00.000Z")
    const merchantCode = deriveConfirmationCode({
      vouchId: "vouch_1",
      publicId: "vch_public",
      participantRole: "merchant",
      participantUserId: "merchant_1",
      at,
    })
    const customerCode = deriveConfirmationCode({
      vouchId: "vouch_1",
      publicId: "vch_public",
      participantRole: "customer",
      participantUserId: "customer_1",
      at,
    })

    expect(merchantCode).toMatch(/^\d{6}$/)
    expect(customerCode).toMatch(/^\d{6}$/)
    expect(merchantCode).not.toBe(customerCode)
    expect(
      verifyConfirmationCode({
        vouchId: "vouch_1",
        publicId: "vch_public",
        participantRole: "customer",
        participantUserId: "customer_1",
        submittedCode: customerCode,
        at,
      })
    ).toBe(true)
    expect(
      verifyConfirmationCode({
        vouchId: "vouch_1",
        publicId: "vch_public",
        participantRole: "customer",
        participantUserId: "customer_1",
        submittedCode: merchantCode,
        at,
      })
    ).toBe(false)
  })
})
