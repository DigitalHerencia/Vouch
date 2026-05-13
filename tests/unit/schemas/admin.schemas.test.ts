import { describe, expect, it } from "vitest"

import {
  adminAuditFilterInputSchema,
  adminSafeRetryInputSchema,
  adminVouchFilterInputSchema,
} from "@/schemas/admin"

describe("admin schemas", () => {
  it("normalizes admin vouch filters", () => {
    const result = adminVouchFilterInputSchema.safeParse({
      status: "expired",
      page: "2",
      pageSize: "25",
      sort: "created_desc",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.pageSize).toBe(25)
    }
  })

  it("rejects unsafe retry operations", () => {
    expect(
      adminSafeRetryInputSchema.safeParse({
        operation: "manual_award_funds",
        entityType: "vouch",
        entityId: "vouch_123",
      }).success
    ).toBe(false)
  })

  it("accepts audit filter query", () => {
    expect(
      adminAuditFilterInputSchema.safeParse({
        entityType: "vouch",
        entityId: "abc",
        page: 1,
      }).success
    ).toBe(true)
  })
})
