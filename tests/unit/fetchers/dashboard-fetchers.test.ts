import { beforeEach, describe, expect, it, vi } from "vitest"

const { findMany, count } = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }))
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    vouch: { findMany, count },
    connectedAccount: { findUnique: vi.fn() },
  },
}))
vi.mock("@/lib/fetchers/authFetchers", () => ({
  requireActiveUser: vi.fn().mockResolvedValue({
    id: "user_1",
  }),
}))
vi.mock("@/lib/integrations/stripe/connected-account-sync", () => ({
  syncConnectedAccountReadinessForUser: vi.fn(),
}))

import { getArchivePageState, getDashboardPageState } from "@/lib/fetchers/dashboardFetchers"

describe("dashboard fetchers", () => {
  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([])
    count.mockReset()
  })

  it("uses accurate database counts while keeping each section list bounded", async () => {
    count
      .mockResolvedValueOnce(21)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(18)
      .mockResolvedValueOnce(35)
      .mockResolvedValueOnce(7)

    const state = await getDashboardPageState()

    expect(state.summary?.counts).toEqual({
      drafts: 21,
      actionRequired: 4,
      active: 18,
      completed: 35,
      expired: 7,
      archived: 0,
    })
    expect(findMany).toHaveBeenCalledTimes(5)
    expect(findMany.mock.calls.every(([query]) => query.take === 10)).toBe(true)
    expect(findMany.mock.calls[1]?.[0].where.AND[1]).toEqual({
      archived: false,
      status: "authorized",
      confirmationOpensAt: { lte: expect.any(Date) },
      confirmationExpiresAt: { gt: expect.any(Date) },
    })
    expect(findMany.mock.calls[2]?.[0].where.AND[1]).toEqual({
      archived: false,
      status: { in: ["protocol_fee_paid", "authorized"] },
      OR: [
        { status: "protocol_fee_paid" },
        { confirmationOpensAt: { gt: expect.any(Date) } },
        { confirmationExpiresAt: { lte: expect.any(Date) } },
      ],
    })
    expect(count).toHaveBeenCalledTimes(5)
    expect(state.variant).toBe("mixed_vouch_states")
  })

  it("loads archived participant Vouches only for the archive page", async () => {
    count.mockResolvedValueOnce(12)

    const state = await getArchivePageState()

    expect(findMany).toHaveBeenCalledTimes(1)
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ OR: [{ merchantId: "user_1" }, { customerId: "user_1" }] }, { archived: true }],
        },
      })
    )
    expect(findMany.mock.calls[0]?.[0]).not.toHaveProperty("take")
    expect(count).toHaveBeenCalledTimes(1)
    expect(state.count).toBe(12)
  })
})
