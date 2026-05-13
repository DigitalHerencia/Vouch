import { describe, expect, it } from "vitest"

import { calculatePlatformFeeCents, calculateVouchPricing } from "@/lib/vouch/fees"

describe("calculateVouchPricing", () => {
  it("keeps customer authorization to the protected amount and charges merchant fee separately", () => {
    expect(calculateVouchPricing({ protectedAmountCents: 10_000 })).toEqual({
      protectedAmountCents: 10_000,
      merchantReceivesCents: 10_000,
      vouchServiceFeeCents: 500,
      processingFeeOffsetCents: 46,
      customerTotalCents: 10_000,
      applicationFeeAmountCents: 0,
    })
  })

  it("uses the 5% service fee when it exceeds the minimum", () => {
    const pricing = calculateVouchPricing({ protectedAmountCents: 50_000 })

    expect(pricing.vouchServiceFeeCents).toBe(2500)
    expect(pricing.merchantReceivesCents).toBe(50_000)
    expect(pricing.applicationFeeAmountCents).toBe(0)
    expect(pricing.customerTotalCents).toBe(pricing.protectedAmountCents)
  })

  it("rejects invalid protected amounts", () => {
    expect(() => calculateVouchPricing({ protectedAmountCents: 0 })).toThrow()
    expect(() => calculateVouchPricing({ protectedAmountCents: -1 })).toThrow()
  })
})

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
