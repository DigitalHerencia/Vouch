import { describe, expect, it } from "vitest"

import { deriveAggregateConfirmationStatus } from "@/lib/vouch/state"
import { isConfirmationWindowOpen } from "@/lib/vouch/time-windows"

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
        payerConfirmed: true,
        payeeConfirmed: false,
      })
    ).toBe("payer_confirmed")

    expect(
      deriveAggregateConfirmationStatus({
        payerConfirmed: true,
        payeeConfirmed: true,
      })
    ).toBe("both_confirmed")
  })
})
