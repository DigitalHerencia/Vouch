import { describe, expect, it } from "vitest"

import {
  getVouchNextAction,
  isFinalVouchStatus,
  normalizeVouchStatusLabel,
} from "@/lib/vouches/status"

describe("vouch status helpers", () => {
  it("labels statuses for user-facing UI", () => {
    expect(normalizeVouchStatusLabel("pending")).toBe("Pending")
    expect(normalizeVouchStatusLabel("active")).toBe("Active")
    expect(normalizeVouchStatusLabel("completed")).toBe("Completed")
  })

  it("detects final states", () => {
    expect(isFinalVouchStatus("completed")).toBe(true)
    expect(isFinalVouchStatus("expired")).toBe(true)
    expect(isFinalVouchStatus("refunded")).toBe(true)
    expect(isFinalVouchStatus("active")).toBe(false)
  })

  it("does not claim one-sided confirmation releases funds", () => {
    const action = getVouchNextAction({
      status: "active",
      role: "payer",
      payerConfirmed: true,
      payeeConfirmed: false,
      confirmationWindowState: "open",
      setupBlocked: false,
    })

    expect(action.kind).toBe("waiting")
    expect(action.label.toLowerCase()).toContain("waiting")
  })
})
