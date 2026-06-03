import { describe, expect, it } from "vitest"

import { assertValidVouchTransition, deriveNextVouchAction } from "@/lib/vouch/state"
import type { NextVouchAction } from "@/types/vouchTypes"
import { getVouchStatusLabel, isFinalVouchStatus } from "@/lib/vouch/status"

describe("vouch status helpers", () => {
  it("labels statuses for user-facing UI", () => {
    expect(getVouchStatusLabel("draft")).toBe("Draft")
    expect(getVouchStatusLabel("protocol_fee_paid")).toBe("Protocol fee paid")
    expect(getVouchStatusLabel("authorized")).toBe("Authorized")
    expect(getVouchStatusLabel("can_capture")).toBe("Can capture")
    expect(getVouchStatusLabel("captured")).toBe("Captured")
    expect(getVouchStatusLabel("expired")).toBe("Expired")
    expect(getVouchStatusLabel("archived")).toBe("Archived")
  })

  it("detects final states", () => {
    expect(isFinalVouchStatus("protocol_fee_paid")).toBe(false)
    expect(isFinalVouchStatus("can_capture")).toBe(false)
    expect(isFinalVouchStatus("captured")).toBe(true)
    expect(isFinalVouchStatus("expired")).toBe(true)
    expect(isFinalVouchStatus("archived")).toBe(true)
  })

  it("does not claim one-sided confirmation releases funds", () => {
    const action: NextVouchAction = deriveNextVouchAction({
      status: "can_capture",
      role: "merchant",
      merchantConfirmed: true,
      customerConfirmed: false,
      readinessBlocked: false,
      confirmationOpensAt: new Date("2026-01-01T10:00:00.000Z"),
      confirmationExpiresAt: new Date("2026-01-01T10:30:00.000Z"),
      now: new Date("2026-01-01T10:15:00.000Z"),
    })

    expect(action.kind).toBe("waiting")
    expect(action.label.toLowerCase()).not.toContain("release")
  })

  it("allows deterministic confirmable to expired resolution", () => {
    expect(() => assertValidVouchTransition({ from: "can_capture", to: "expired" })).not.toThrow()
  })

  it("blocks reopening terminal Vouches", () => {
    expect(() => assertValidVouchTransition({ from: "expired", to: "captured" })).toThrow(
      "Invalid Vouch transition"
    )
  })
})
