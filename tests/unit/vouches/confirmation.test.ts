import { describe, expect, it } from "vitest"

import {
  canConfirmPresence,
  getAggregateConfirmationStatus,
  isInsideConfirmationWindow,
} from "@/lib/vouches/confirmation"

describe("confirmation helpers", () => {
  it("detects an open confirmation window", () => {
    const now = new Date("2026-04-25T16:00:00.000Z")

    expect(
      isInsideConfirmationWindow({
        now,
        confirmationOpensAt: new Date("2026-04-25T15:55:00.000Z"),
        confirmationExpiresAt: new Date("2026-04-25T16:30:00.000Z"),
      })
    ).toBe(true)
  })

  it("blocks confirmation before window opens", () => {
    const result = canConfirmPresence({
      now: new Date("2026-04-25T15:00:00.000Z"),
      vouchStatus: "active",
      confirmationOpensAt: new Date("2026-04-25T15:55:00.000Z"),
      confirmationExpiresAt: new Date("2026-04-25T16:30:00.000Z"),
      alreadyConfirmed: false,
      isParticipant: true,
    })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe("window_not_open")
  })

  it("reports aggregate confirmation status", () => {
    expect(
      getAggregateConfirmationStatus({
        payerConfirmed: false,
        payeeConfirmed: false,
      })
    ).toBe("none_confirmed")

    expect(
      getAggregateConfirmationStatus({
        payerConfirmed: true,
        payeeConfirmed: false,
      })
    ).toBe("payer_confirmed")

    expect(
      getAggregateConfirmationStatus({
        payerConfirmed: true,
        payeeConfirmed: true,
      })
    ).toBe("both_confirmed")
  })
})
