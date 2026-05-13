import { describe, expect, it } from "vitest"

import {
  archiveVouchSchema,
  confirmPresenceSchema,
  createVouchSchema,
} from "@/schemas/vouch"

describe("vouch schemas", () => {
  it("accepts a valid create Vouch payload", () => {
    const now = new Date()
    const meetingStartsAt = new Date(now.getTime() + 60 * 60 * 1000)
    const confirmationOpensAt = new Date(now.getTime() + 55 * 60 * 1000)
    const confirmationExpiresAt = new Date(now.getTime() + 90 * 60 * 1000)

    const result = createVouchSchema.safeParse({
      amountCents: 12_500,
      currency: "usd",
      appointmentStartsAt: meetingStartsAt,
      confirmationOpensAt,
      confirmationExpiresAt,
      disclaimerAccepted: true,
    })

    expect(result.success).toBe(true)
  })

  it("rejects invalid currency casing", () => {
    const result = createVouchSchema.safeParse({
      amountCents: 5000,
      currency: "USD",
      appointmentStartsAt: new Date(),
      confirmationOpensAt: new Date(),
      confirmationExpiresAt: new Date(Date.now() + 60_000),
    })

    expect(result.success).toBe(false)
  })

  it("rejects self-contradictory confirm payloads", () => {
    expect(confirmPresenceSchema.safeParse({ vouchId: "" }).success).toBe(false)
  })

  it("accepts archive mutations", () => {
    expect(archiveVouchSchema.safeParse({ vouchId: "vouch_123" }).success).toBe(true)
  })
})
