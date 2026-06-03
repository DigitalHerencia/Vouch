import { describe, expect, it, vi } from "vitest"

import { bindCustomerToVouchTx } from "@/lib/db/transactions/vouchTransactions"

const vouchRecord = {
  id: "vouch_1",
  publicId: "vch_public",
  merchantId: "merchant_1",
  customerId: "customer_1",
  amountCents: 10_000,
  currency: "usd",
  appointmentAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationOpensAt: new Date("2026-05-01T16:00:00.000Z"),
  confirmationExpiresAt: new Date("2026-05-01T17:00:00.000Z"),
  status: "active",
  protocolFeePaidAt: null,
  authorizedAt: null,
  capturedAt: null,
  voidedAt: null,
  expiredAt: null,
  archived: false,
  archivedAt: null,
  createdAt: new Date("2026-04-28T00:00:00.000Z"),
  updatedAt: new Date("2026-04-28T00:00:00.000Z"),
}

describe("vouch transaction helpers", () => {
  it("binds only an unclaimed active Vouch to a non-merchant customer", async () => {
    const tx = {
      vouch: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue(vouchRecord),
      },
    }

    await expect(
      bindCustomerToVouchTx(tx as never, { vouchId: "vouch_1", customerId: "customer_1" })
    ).resolves.toMatchObject({ id: "vouch_1", status: "active", customerId: "customer_1" })

    expect(tx.vouch.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "vouch_1",
          status: { in: ["draft", "active"] },
          customerId: null,
          merchantId: { not: "customer_1" },
        },
        data: {
          customerId: "customer_1",
          status: "active",
        },
      })
    )
  })

  it("throws a conflict when the guarded accept update does not win", async () => {
    const tx = {
      vouch: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUniqueOrThrow: vi.fn(),
      },
    }

    await expect(
      bindCustomerToVouchTx(tx as never, { vouchId: "vouch_1", customerId: "customer_1" })
    ).rejects.toThrow("VOUCH_ACCEPTANCE_CONFLICT")

    expect(tx.vouch.findUniqueOrThrow).not.toHaveBeenCalled()
  })
})
