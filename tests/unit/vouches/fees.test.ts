import { describe, expect, it } from "vitest"

import { calculatePlatformFeeCents } from "@/lib/vouch/fees"

describe("calculatePlatformFeeCents", () => {
  it("uses minimum fee when percentage would be lower", () => {
    expect(calculatePlatformFeeCents({ amountCents: 1000 })).toBe(500)
  })

  it("scales with amount", () => {
    const small = calculatePlatformFeeCents({ amountCents: 5000 })
    const large = calculatePlatformFeeCents({ amountCents: 50_000 })

    expect(small).toBe(500)
    expect(large).toBe(2500)
    expect(large).toBeGreaterThan(small)
  })

  it("rejects invalid amounts", () => {
    expect(() => calculatePlatformFeeCents({ amountCents: 0 })).toThrow()
    expect(() => calculatePlatformFeeCents({ amountCents: -1 })).toThrow()
  })
})
