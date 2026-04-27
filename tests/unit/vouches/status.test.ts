import { describe, expect, it } from "vitest"

import { deriveNextVouchAction, type NextVouchAction } from "@/lib/vouch/state"
import { getVouchStatusLabel, isFinalVouchStatus } from "@/lib/vouch/status"

describe("vouch status helpers", () => {
  it("labels statuses for user-facing UI", () => {
    expect(getVouchStatusLabel("pending")).toBe("Pending")
    expect(getVouchStatusLabel("active")).toBe("Active")
    expect(getVouchStatusLabel("completed")).toBe("Completed")
    expect(getVouchStatusLabel("expired")).toBe("Expired")
    expect(getVouchStatusLabel("refunded")).toBe("Refunded")
    expect(getVouchStatusLabel("canceled")).toBe("Canceled")
    expect(getVouchStatusLabel("failed")).toBe("Failed")
  })

  it("detects final states", () => {
    expect(isFinalVouchStatus("pending")).toBe(false)
    expect(isFinalVouchStatus("active")).toBe(false)
    expect(isFinalVouchStatus("completed")).toBe(true)
    expect(isFinalVouchStatus("expired")).toBe(true)
    expect(isFinalVouchStatus("refunded")).toBe(true)
    expect(isFinalVouchStatus("canceled")).toBe(true)
    expect(isFinalVouchStatus("failed")).toBe(true)
  })

  it("does not claim one-sided confirmation releases funds", () => {
    const action: NextVouchAction = deriveNextVouchAction({
      status: "active",
      role: "payer",
      payerConfirmed: true,
      payeeConfirmed: false,
      setupBlocked: false,
      confirmationOpensAt: new Date("2026-01-01T10:00:00.000Z"),
      confirmationExpiresAt: new Date("2026-01-01T10:30:00.000Z"),
      now: new Date("2026-01-01T10:15:00.000Z"),
    })

    expect(action.kind).toBe("waiting")
    expect(action.label.toLowerCase()).not.toContain("release")
  })
})
