import { describe, expect, it } from "vitest"

import {
  assertValidVouchTransition,
  deriveNextVouchAction,
  type NextVouchAction,
} from "@/lib/vouch/state"
import { getVouchStatusLabel, isFinalVouchStatus } from "@/lib/vouch/status"

describe("vouch status helpers", () => {
  it("labels statuses for user-facing UI", () => {
    expect(getVouchStatusLabel("draft")).toBe("Draft")
    expect(getVouchStatusLabel("committed")).toBe("Committed")
    expect(getVouchStatusLabel("sent")).toBe("Sent")
    expect(getVouchStatusLabel("accepted")).toBe("Accepted")
    expect(getVouchStatusLabel("authorized")).toBe("Authorized")
    expect(getVouchStatusLabel("confirmable")).toBe("Confirmable")
    expect(getVouchStatusLabel("completed")).toBe("Completed")
    expect(getVouchStatusLabel("expired")).toBe("Expired")
  })

  it("detects final states", () => {
    expect(isFinalVouchStatus("sent")).toBe(false)
    expect(isFinalVouchStatus("confirmable")).toBe(false)
    expect(isFinalVouchStatus("completed")).toBe(true)
    expect(isFinalVouchStatus("expired")).toBe(true)
  })

  it("does not claim one-sided confirmation releases funds", () => {
    const action: NextVouchAction = deriveNextVouchAction({
      status: "confirmable",
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
    expect(() => assertValidVouchTransition({ from: "confirmable", to: "expired" })).not.toThrow()
  })

  it("blocks reopening terminal Vouches", () => {
    expect(() => assertValidVouchTransition({ from: "expired", to: "completed" })).toThrow(
      "Invalid Vouch transition"
    )
  })
})
